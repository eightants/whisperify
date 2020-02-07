const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const api = require('./routes/api');
const port = process.env.PORT || 8888;
const app = express();

app.use(express.static(path.join(__dirname, 'dist/')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', api);
/**
Whisper - Backend
---
Performs the Authorization Code oAuth2 flow to authenticate against
the Spotify Accounts with Nodejs and Express. Sets up API to be 
called by the frontend application
**/

var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

const dotenv = require('dotenv');
dotenv.config();

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var basePath = 'https://whisperify.now.sh'
var redirect_uri = 'https://whisperify.now.sh/callback/'; // Your redirect uri


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


app.use(cors())
   .use(cookieParser());

/* LOGIN WITH SPOTIFY */
// Handling Log In with Spotify with login path
app.get('/login', function(req, res) {

  console.log("hhhhhh")
  console.log(client_id)
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
app.get('/callback/', function(req, res) {

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

        // redirects back to browser frontend
        res.redirect(basePath + '/?authorized=true#'+ access_token);
      } else {
        res.redirect(basePath + '/?' +
          querystring.stringify({
            error: 'invalid_token#error'
          }));
      }
    });
  }
});

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

/*app.use('/js', express.static(path.join(__dirname, 'dist/js')));*/

/* WHY DOES IT NOT RETURN THE JS FILES WHEN REQUESTED?
TEMP SOLUTION: MANUALLY DEFINE JS ROUTES */

app.get('/polyfills-es2015.27661dfa98f6332c27dc.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/polyfills-es2015.27661dfa98f6332c27dc.js'));
});

app.get('/runtime-es2015.858f8dd898b75fe86926.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/runtime-es2015.858f8dd898b75fe86926.js'));
});

app.get('/runtime-es5.741402d1d47331ce975c.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/runtime-es5.741402d1d47331ce975c.js'));
});

app.get('/polyfills-es5.4e06eb653a3c8a2d581f.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/polyfills-es5.4e06eb653a3c8a2d581f.js'));
});

app.get('/main-es5.c424bcca5f64129739b1.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/main-es5.c424bcca5f64129739b1.js'));
});

app.get('/main-es2015.5abd61923614fefc478a.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/main-es2015.5abd61923614fefc478a.js'));
});

/* CATCHALL ROUTE: ANGULAR WILL HANDLE THE REST */

app.get('*', (req, res) => {
  /*if (req.url.endsWith('.js')) {
    res.writeHeader(200, {
        'Content-Type': 'application/javascript'
    })
    res.end();
  }*/
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});
app.listen(port, function() {
    console.log('server running on localhost:' + port);
});