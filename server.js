const fs = require("fs");
const qs = require("qs");
const crypto = require("crypto");

const express = require("express");
const session = require("express-session");
const axios = require("axios");
const sessionFileStore = require("session-file-store");

const myClientId = "0940f71b4f3c4e2a8f70c052c91804ce";
const myClientSecret = fs.readFileSync("client_secret.txt", "utf-8").trim();
const redirectUri = `http://spotify.robertq.soda.csua.berkeley.edu/callback/`;
const socketPath = "/home/robertq/public_html/spotify.sock";


const app = express();
app.set('view engine', 'pug');
app.use(express.static("public"));

const FileStore = sessionFileStore(session);
const myFileStore = new FileStore({});
app.use(session({store: myFileStore, secret: "vYvxrRfgureXnbFuuu", resave: false, saveUninitialized: false,
  genid: req => {
    return crypto.randomBytes(8).toString("hex");
  }
}));

app.get("/", (req, res) => {
  let sess = req.session;
  res.render("index", {sess, cache: true});
});

app.get("/callback/", async (req, res) => {
  if (req.query.error) {
    console.log(req.query.error);
  }
  if (!req.query.code) {
    res.write("Error logging in");
  }
  let request = {
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    client_id: myClientId,
    client_secret: myClientSecret,
    code: req.query.code,
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    }
  };
  try {
    let tokenResp = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify(request)
    );
    let sess = req.session;
    let accessToken = tokenResp.data.access_token;
    let refreshToken = tokenResp.data.refresh_token;
    sess.accessToken = accessToken;
    sess.refreshToken = refreshToken;
    let currentUser = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    sess.displayName = currentUser.data.display_name;
    if (currentUser.data.images[0])
      sess.imageUrl = currentUser.data.images[0].url;
    sess.loggedIn = true;
    res.redirect("/");
  } catch (err) {
    if (err.response) {
      console.log(err.response.status, err.response.statusText);
      console.log(err.response.data);
      res.write(err.response.data.error_description);
    } else {
      console.log(err);
      res.write("An error occured.");
    }
  }
  res.end();
});

app.get("/login/", (req, res) => {
  let scopes = "user-read-currently-playing";
  let next = req.query.next;
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      "?response_type=code" +
      "&client_id=" +
      myClientId +
      (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
      "&redirect_uri=" +
      encodeURIComponent(redirectUri)
  );
});

app.get("/logout/", (req, res, next) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/");
      }
    })
  }
});

const playing = async token => {
  return axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

app.get("/api/playing/", async (req, res) => {
  if (req.query.sid) {
    let sid = req.query.sid;
    myFileStore.get(sid, async (err, sess) => {
      if (err) {
        res.sendStatus(403);
        return;
      }
      try {
        var currentlyPlaying = await playing(sess.accessToken);
      } catch (err) {
        console.log(err);
        res.sendStatus(403);
        return;
      }
      if (currentlyPlaying.status == 204) {
        res.end("no currently playing track");
      } else {
        let data = currentlyPlaying.data;
        res.end(JSON.stringify(data));
      }
    });
  } else {
    res.status(403).end("Session ID (sid) required.");
  }
});

app.get("/api/playing-oneline/", async (req, res) => {
  if (req.query.sid) {
    let sid = req.query.sid;
    myFileStore.get(sid, async (err, sess) => {
      if (err) {
        res.sendStatus(403);
        return;
      }
      try {
        var currentlyPlaying = await playing(sess.accessToken);
      } catch (err) {
        console.log(err);
        res.sendStatus(403);
        return;
      }
      if (currentlyPlaying.status == 204) {
        res.end("no currently playing track");
      } else {
        let data = currentlyPlaying.data;
        let msToTime = ms => `${Math.floor(ms/1000/60)}:${Math.floor(ms/1000 % 60).toString().padStart(2, "0")}`;
        let artists = data.item.album.artists.map(artist => artist.name).join(", ");
        res.end(`${msToTime(data.progress_ms)}/${msToTime(data.item.duration_ms)} ${artists} - ${data.item.name} [${data.item.album.name}]\n`)
      }
    });
  } else {
    res.status(403).end("Session ID (sid) required.");
  }
});

app.get("/playing/", async (req, res) => {
  let sess = req.session;
  if (sess.loggedIn) {
    try {
      var currentlyPlaying = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: `Bearer ${sess.accessToken}` }
      });
    } catch (err) {
      console.log(err);
      res.sendStatus(401);
      return;
    }
    if (currentlyPlaying.status == 204) {
      res.write("no currently playing track");
    } else {
      let msToTime = ms => `${Math.floor(ms/1000/60)}:${Math.floor(ms/1000 % 60).toString().padStart(2, "0")}`;
      let data = currentlyPlaying.data;
      let artists = data.item.album.artists.map(artist => artist.name).join(", ");
      console.log(`${sess.displayName} is listening to ${data.item.name} by ${artists}`);
      res.render("playing", {data, artists, msToTime, sess})
    }
    res.end();
  } else {
    res.redirect(`/login/`);
  }
});

fs.stat(socketPath, err => {
  if (!err) {
    fs.unlinkSync(socketPath);
  }
  app.listen(socketPath, ()=>{
    fs.chmodSync(socketPath, '777');
    console.log(`Express listening on ${socketPath}`);
  });
})
// vim: et sw=2
