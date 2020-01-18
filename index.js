/**
Whisper - Backend
---
Performs the Authorization Code oAuth2 flow to authenticate against
the Spotify Accounts with Nodejs and Express. Sets up API to be 
called by the frontend application
**/

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var path = require("path");

const dotenv = require('dotenv');
dotenv.config();

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = 'http://localhost:8888/callback/'; // Your redirect uri


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

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/dist/'))
   .use(cors())
   .use(cookieParser());

/* LOGIN WITH SPOTIFY */
// Handling Log In with Spotify with login path
app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // redirects user to Spotify login page with scopes of information access
  var scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});



/* CALLBACK URL from Spotify verification */
// when verification is complete, render homepage
app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    // if state does not match, error
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    // gets and returns authentication token
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        // configs for api call
        var options = {
          url: 'https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10&offset=0',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };


        /* API SETUP */
        // saves token in json format to a path to be accessed by the frontend if needed
        app.get('/api/token', function(req, res) {
          res.send({access_token: access_token});
        });
        // returns top tracks of user from get request
        request.get(options, function(error, response, body) {
          console.log(body);
          app.get('/api/tracks', function(req, res) {
            res.send({top_tracks: body.items});
          });
        });

        // redirects back to browser frontend
        res.redirect('http://localhost:8888/?authorized=true#'+ access_token);
      } else {
        res.redirect('http://localhost:8888/?' +
          querystring.stringify({
            error: 'invalid_token#error'
          }));
      }
    });
  }
});


function getRoot(request, response) {
  response.sendFile(path.resolve('./dist/index.html'));
}
function getUndefined(request, response) {
  response.sendFile(path.resolve('./dist/index.html'));
}
app.get('/', getRoot);
app.get('/*', getUndefined);


// requests new token
app.get('/refresh_token', function(req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

// starts server
console.log('Listening on 8888');
app.listen(8888);
