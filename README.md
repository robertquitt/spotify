# Spotify "Currently Playing" API

Live at: http://spotify.robertq.soda.csua.berkeley.edu/

If you're like me and you spend all your time in the terminal, you want to have an indicator telling you which song is currently playing.
However, the spotify API is not accessible without jumping through many hoops.

This service provides both a "one line" API for tmux, and a general json endpoint if you want to parse the output yourself.

```
$ curl spotify.robertq.soda.csua.berkeley.edu/api/playing-oneline?sid=79cd26e7
2:18/3:54 C418 - Wait [Minecraft - Volume Beta]
$ curl spotify.robertq.soda.csua.berkeley.edu/api/playing?sid=79cd26e7 | jq .
{
  "timestamp": 1638480460309,
  "context": {
    "external_urls": {
      "spotify": "https://open.spotify.com/playlist/5T09FzCAuM9WEeN6MAySU7"
    },
    "href": "https://api.spotify.com/v1/playlists/5T09FzCAuM9WEeN6MAySU7",
    "type": "playlist",
    "uri": "spotify:playlist:5T09FzCAuM9WEeN6MAySU7"
  },
  "progress_ms": 1989,
  "item": {
    "album": {
      "album_type": "album",
      "artists": [
        {
          "external_urls": {
            "spotify": "https://open.spotify.com/artist/4uFZsG1vXrPcvnZ4iSQyrx"
          },
          "href": "https://api.spotify.com/v1/artists/4uFZsG1vXrPcvnZ4iSQyrx",
          "id": "4uFZsG1vXrPcvnZ4iSQyrx",
          "name": "C418",
          "type": "artist",
          "uri": "spotify:artist:4uFZsG1vXrPcvnZ4iSQyrx"
        }
      ],
      "external_urls": {
        "spotify": "https://open.spotify.com/album/7CYDRyFCKtAYJBSpfovLyX"
      },
      "href": "https://api.spotify.com/v1/albums/7CYDRyFCKtAYJBSpfovLyX",
      "id": "7CYDRyFCKtAYJBSpfovLyX",
      "images": [
        {
          "height": 640,
          "url": "https://i.scdn.co/image/ab67616d0000b2734cf0b29eb06a92aa96acae64",
          "width": 640
        },
        {
          "height": 300,
          "url": "https://i.scdn.co/image/ab67616d00001e024cf0b29eb06a92aa96acae64",
          "width": 300
        },
        {
          "height": 64,
          "url": "https://i.scdn.co/image/ab67616d000048514cf0b29eb06a92aa96acae64",
          "width": 64
        }
      ],
      "name": "Minecraft - Volume Beta",
      "release_date": "2013-11-09",
      "release_date_precision": "day",
      "total_tracks": 30,
      "type": "album",
      "uri": "spotify:album:7CYDRyFCKtAYJBSpfovLyX"
    },
    "artists": [
      {
        "external_urls": {
          "spotify": "https://open.spotify.com/artist/4uFZsG1vXrPcvnZ4iSQyrx"
        },
        "href": "https://api.spotify.com/v1/artists/4uFZsG1vXrPcvnZ4iSQyrx",
        "id": "4uFZsG1vXrPcvnZ4iSQyrx",
        "name": "C418",
        "type": "artist",
        "uri": "spotify:artist:4uFZsG1vXrPcvnZ4iSQyrx"
      }
    ],
    "disc_number": 1,
    "duration_ms": 176000,
    "explicit": false,
    "external_ids": {
      "isrc": "TCABR1368242"
    },
    "external_urls": {
      "spotify": "https://open.spotify.com/track/4JusUA5PJZAYOurOAlm0FG"
    },
    "href": "https://api.spotify.com/v1/tracks/4JusUA5PJZAYOurOAlm0FG",
    "id": "4JusUA5PJZAYOurOAlm0FG",
    "is_local": false,
    "name": "Beginning 2",
    "popularity": 51,
    "preview_url": "https://p.scdn.co/mp3-preview/c9b7021aa9c67bb2f11d27cf15ee202933d64e5b?cid=0940f71b4f3c4e2a8f70c052c91804ce",
    "track_number": 17,
    "type": "track",
    "uri": "spotify:track:4JusUA5PJZAYOurOAlm0FG"
  },
  "currently_playing_type": "track",
  "actions": {
    "disallows": {
      "resuming": true
    }
  },
  "is_playing": true
}```
