/**
 * Whisperify Mock Server
 * ---
 * A lightweight version of the Whisperify backend for open source development.
 * Most of Whisperify's features are frontend-heavy, the server is mostly used for authentication and database calls.
 * Contribute to Whisperify by creating a new feature and making a pull request at https://github.com/eightants/whisperify
 */

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const port = process.env.PORT || 8888;
const app = express();

app.use(express.static(path.join(__dirname, "dist/")));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(bodyParser.json({ limit: "10mb" }));

var request = require("request"); // "Request" library
var cors = require("cors");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");

const dotenv = require("dotenv");
dotenv.config();

app.use(cors()).use(cookieParser());

/**
 * User Variables
 * Please fill this in for the mock-server to function correctly.
 */
// TODO: YOUR APP CLIENT ID AND SECRET HERE
var client_id = "id"; 
var client_secret = "secret";
// TODO: Your redirect uri as entered in your Spotify app
var redirect_uri = "http://localhost:8888/callback/";
var basePath = "http://localhost:4200"; // For the frontend, this is the default port for Angular


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
Spotify Authentication
---
Performs the Authorization Code oAuth2 flow to authenticate against
the Spotify Accounts with Nodejs and Express.
**/

var stateKey = "spotify_auth_state";

// Handling Log In with Spotify with login path
app.get("/login", function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // redirects user to Spotify login page with scopes of information access
  var scope =
    "user-read-private user-top-read playlist-read-private playlist-read-collaborative playlist-modify-public";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

/* CALLBACK URL from Spotify verification */
// when verification is complete, render homepage
app.get("/callback/", function (req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    // if state does not match, error
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    // gets and returns authentication token
    res.clearCookie(stateKey);
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        // redirects back to browser frontend
        res.redirect(basePath + "/?authorized=true#" + access_token);
      } else {
        res.redirect(
          basePath +
            "/?" +
            querystring.stringify({
              error: "invalid_token#error",
            })
        );
      }
    });
  }
});

// public get API for playlist data
app.get("/api/features/playlist/:id/:token", cors(), function (req, res) {
  return res.json({
    title: "Bonfire Nights",
    owner: "eightants",
    total: 32,
    uri: "whisperify",
    features: {
      acousticness: 0.7,
      danceability: 0.7,
      energy: 0.5,
      valence: 0.5,
      liveness: 0.2,
      speechiness: 0.1,
      instrumentalness: 0.1,
      tempo: 125,
      loudness: 0.5,
    },
  });
});

// public get API for album data
app.get("/api/features/album/:id/:token", cors(), function (req, res) {
  return res.json({
    title: "Stories",
    artist: "Avicii",
    features: {
      acousticness: 0.5,
      danceability: 0.9,
      energy: 0.6,
      valence: 0.23,
      liveness: 0.3,
      speechiness: 0.05,
      instrumentalness: 0.1,
      tempo: 125,
      loudness: 0.5,
    },
  });
});

// private api for guest access on analysis
app.get("/api/getalbumfeatures/:id", function (req, res) {
  return res.json({
    title: "Stories",
    artist: "Avicii",
    features: {
      acousticness: 0.5,
      danceability: 0.5,
      energy: 0.5,
      valence: 0.5,
      liveness: 0.5,
      speechiness: 0.1,
      instrumentalness: 0.1,
      tempo: 125,
      loudness: 0.5,
    },
  });
});

// ENDPOINTS for DB communication
// each key in req.body will match the keys in the data object that you passed in
app.post("/api/postuser", function (req, res) {
  return res.json({ response: req.body, status: "success" });
});

app.post("/api/postscore", function (req, res) {
  return res.json({ response: req.body, status: "success" });
});

app.post("/api/postpercent", function (req, res) {
  return res.json({ percent: 0.3 });
});

app.post("/postsurvey", function (req, res) {
  return res.json({ response: req.body, status: "success" });
});

app.post("/postchallenge", function (req, res) {
  res.writeHead(200, {
    "Content-Type": "text/plain",
  });
  res.write("eightants");
  res.end();
});

app.get("/getchallenge/:code", function (req, res) {
  return res.json({ status: "success" });
});

app.post("/postchallengescore", function (req, res) {
  return res.json({ response: req.body, status: "success" });
});

app.get("/cleanchallenges", function (req, res) {
  return res.json({status: "success"});
});

app.get("/api/user/:user", function (req, res) {
  return res.json({
    acousticness: 0.3,
    danceability: 0.2,
    energy: 0.5,
    valence: 0.5,
    liveness: 0.5,
    speechiness: 0.5,
    instrumentalness: 0.5,
    tempo: 125,
    loudness: 0.5,
  })
});

app.get("/api/features/user/:user", cors(), function (req, res) {
  return res.json({
    acousticness: 0.3,
    danceability: 0.2,
    energy: 0.5,
    valence: 0.5,
    liveness: 0.5,
    speechiness: 0.5,
    instrumentalness: 0.5,
    tempo: 125,
    loudness: 0.5,
  })
});

app.get("/api/features/group/:category", cors(), function (req, res) {
  return res.json([{
    acousticness: 0.5,
    danceability: 0.2,
    energy: 0.2,
    valence: 0.2,
    liveness: 0.5,
    speechiness: 0.3,
    instrumentalness: 0.3,
    tempo: 125,
    loudness: 0.5,
  }])
});

app.post("/api/postanalysis", function (req, res) {
  return res.json({ response: req.body, status: "success" });
});

// Server is Running!
app.listen(port, function () {
  console.log("server running on localhost:" + port);
});
