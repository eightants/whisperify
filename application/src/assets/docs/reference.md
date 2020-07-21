# Reference
As an open-source project, Whisperify is dedicated to give back. A public API is currently under works to provide endpoints to access audio feature analysis for Spotify users in over 70 countries and 16 personalities. Other endpoints are wrappers for the Spotify API combined with Whisperify's features: getting audio features for an album, getting clusters of genres for a user or artist, getting a recreated taste profile of a user. 

This documentation page gives an overview of the usage of those endpoints and their responses. 

**Base URL:** `https://whisperify.net/api`

| Method | Endpoint | Usage |
|:---|:---|:---|
| GET | `/api/features/group/all`  | Gets audio features for all Users  |
| GET | `/api/features/user/:username`  | Gets audio features for a specific User  |
| GET | `/api/features/group/country/:code`  | Gets audio features for a Country  |
| GET | `/api/features/group/personality/:code`  | Gets audio features for a Personality  |
| GET | `/api/features/album/:album_id/:token`  | Gets audio features for an Album  |
| GET | `/api/features/playlist/:playlist_id/:token`  | Gets audio features for a Playlist  |

<br>

<h2 id="get-all-users">Get audio features for all Users</h2>

Audio Features endpoint provides danceability, energy, valence, and more for all of the tracks in the Spotify catalog from Echo Nest. Read more about audio features on the [Spotify docs](https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/).

The endpoint provides a calculated average of the audio features for all users of Whisperify. 

### Endpoint
`/api/features/group/all`

### Sample Response
```json
[
    {
        "_id": null,
        "acousticness": 0.2335424936932086,
        "danceability": 0.5807770093645571,
        "energy": 0.6539215610367248,
        "valence": 0.45854691845460704,
        "liveness": 0.1951512681352488,
        "speechiness": 0.09907227520601786, 
        "instrumentalness": 0.6539215610367248,
        "loudness": -32,
        "tempo": 120
    }
]
```

<br>

<h2 id="get-user">Get audio features for a specific User</h2>

The endpoint provides the last logged audio features from a specific user on Whisperify. 

### Endpoint
`/api/features/user/:username`

### Request Parameters
| Parameter | Value |
|:---|:---|
| username | The user's [Spotify user id](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) |

### Sample Response
```json
{
    "_id": "at8official",
    "acousticness": 0.3274022999999999,
    "danceability": 0.61684,
    "energy": 0.5741999999999999,
    "instrumentalness": 0.0042204432,
    "liveness": 0.140242,
    "loudness": -7.550030000000001,
    "speechiness": 0.06646100000000002,
    "tempo": 111.46637000000003,
    "valence": 0.06646100000000002,
}
```

<br>

<h2 id="get-country">Get audio features for a Country</h2>

The endpoint provides the average audio features of Spotify users in a country. 

### Endpoint
`/api/features/group/country?code={code}`

### Request Parameters
| Parameter | Value |
|:---|:---|
| code | The [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code of the country |

### Sample Response
```json
{
    "_id": "GB",
    "acousticness": 0.21761597930230905,
    "danceability": 0.5777063676731794,
    "energy": 0.6675633091474245,
    "valence": 0.4630304351687389,
    "liveness": 0.19433175044404974,
    "speechiness": 0.10059741651865009, 
    "instrumentalness": 0.6539215610367248,
    "loudness": -32,
    "tempo": 120
},
```

<br>

<h2 id="get-personality">Get audio features for a Personality</h2>

The endpoint provides the average audio features of Spotify users with the specified personality. 

### Endpoint
`/api/features/group/personality?code={code}`

### Request Parameters
| Parameter | Value |
|:---|:---|
| code | The [Myers–Briggs Type Indicator](https://en.wikipedia.org/wiki/Myers%E2%80%93Briggs_Type_Indicator) of the personality type |

### Sample Response
```json
{
    "_id": "ENFJ",
    "acousticness": 0.21761597930230905,
    "danceability": 0.5777063676731794,
    "energy": 0.6675633091474245,
    "valence": 0.4630304351687389,
    "liveness": 0.19433175044404974,
    "speechiness": 0.10059741651865009, 
    "instrumentalness": 0.6539215610367248,
    "loudness": -32,
    "tempo": 120
},
```

<br>

<h2 id="get-album">Get audio features for an Album</h2>

The endpoint provides the average audio features of a Spotify album. 

### Endpoint
`/api/features/album/:album_id/:token`

### Request Parameters
| Parameter | Value |
|:---|:---|
| album_id | The [Spotify ID](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the album. |
| token | A valid access token from the Spotify Accounts service: see the [Web API Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/) for details. |

### Sample Response
```json
{
    "title": "Stories",
    "artist": "Avicii",
    "features": {
        "acousticness": 0.21761597930230905,
        "danceability": 0.5777063676731794,
        "energy": 0.6675633091474245,
        "valence": 0.4630304351687389,
        "liveness": 0.19433175044404974,
        "speechiness": 0.10059741651865009, 
        "instrumentalness": 0.6539215610367248,
        "loudness": -32,
        "tempo": 120
    },
}
```

<br>

<h2 id="get-playlist">Get audio features for an Playlist</h2>

The endpoint provides the average audio features of a Spotify playlist. 

### Endpoint
`/api/features/playlist/:playlist_id/:token`

### Request Parameters
| Parameter | Value |
|:---|:---|
| playlist_id | The [Spotify ID](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the playlist. |
| token | A valid access token from the Spotify Accounts service: see the [Web API Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/) for details. |

### Sample Response
```json
{
    "title": "Bonfire Nights",
    "owner": "eightants",
    "total": 32,
    "uri": "asd234nic82383",
    "features": {
        "acousticness": 0.21761597930230905,
        "danceability": 0.5777063676731794,
        "energy": 0.6675633091474245,
        "valence": 0.4630304351687389,
        "liveness": 0.19433175044404974,
        "speechiness": 0.10059741651865009, 
        "instrumentalness": 0.6539215610367248,
        "loudness": -32,
        "tempo": 120
    },
}
```

<br>

