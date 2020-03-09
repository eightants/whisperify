const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.PORT || 8888;
const app = express();

const {MongoClient} = require('mongodb');
// main mongo function
async function mongo(operation, params) {
  const uri = process.env.MONGO;
  const client = new MongoClient(uri);
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    // Make the appropriate DB calls
    if (operation == "insert") {
      await upsertUser(client, params["_id"], params);
    } else if (operation == "percent") {
      var p = await  getPercent(client, params);
      return p;
    } else if (operation == "survey") {
      var p = await upsertSurvey(client, params["_id"], params);
    }
  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
}

async function getPercent(client, myscore){
  var col = await client.db("whisperify-prod").collection("users").countDocuments( { score: { $lte: myscore } } );
  col  = col / await client.db("whisperify-prod").collection("users").countDocuments( { score: { $gte: 0 } } );
  //console.log(col)
  //col.countDocuments( { score: { $lte: myscore } } ) / col.countDocuments( { score: { $gte: "0" } } )
  return (col);
};

async function upsertUser(client, id, updatedData) {
  result = await client.db("whisperify-prod").collection("users")
                      .updateOne({ _id: id }, 
                                 { $set: updatedData }, 
                                 { upsert: true });
  console.log(`${result.matchedCount} document(s) matched the query criteria.`);

  if (result.upsertedCount > 0) {
      console.log(`One document was inserted with the id ${result.upsertedId._id}`);
  } else {
      console.log(`${result.modifiedCount} document(s) was/were updated.`);
  }
}

async function upsertSurvey(client, id, updatedData) {
  result = await client.db("whisperify-prod").collection("responses")
                      .updateOne({ _id: id }, 
                                 { $set: updatedData }, 
                                 { upsert: true });
  console.log(`${result.matchedCount} document(s) matched the query criteria.`);

  if (result.upsertedCount > 0) {
      console.log(`One document was inserted with the id ${result.upsertedId._id}`);
  } else {
      console.log(`${result.modifiedCount} document(s) was/were updated.`);
  }
}




app.use(express.static(path.join(__dirname, 'dist/')));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json({ limit: '10mb'}));
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
var basePath = 'https://whisperify.net'
var redirect_uri = 'https://whisperify.net/callback/'; // Your redirect uri

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

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // redirects user to Spotify login page with scopes of information access
  var scope = 'user-read-private user-top-read playlist-read-private playlist-read-collaborative';
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

app.post("/postuser", function(req, res) {
  // each key in req.body will match the keys in the data object that you passed in
  //console.log(req.body["at8official"]["tracks"][0]);
  console.log("success");
  var obj = req.body;
  mongo("insert", obj).catch(console.error);
});

app.post("/postscore", function(req, res) {
  // each key in req.body will match the keys in the data object that you passed in
  //console.log(req.body);
  var obj = req.body["score"];
  mongo("percent", obj).then(
    re => {
      //console.log("pre", re);
      return res.json({percent: re})
    }
  ).catch(console.error)
});

app.post("/postsurvey", function(req, res) {
  // each key in req.body will match the keys in the data object that you passed in
  var obj = req.body;
  mongo("survey", obj).catch(console.error);
});


/*
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
*/
/*app.use('/js', express.static(path.join(__dirname, 'dist/js')));*/

/* WHY DOES IT NOT RETURN THE JS FILES WHEN REQUESTED?
TEMP SOLUTION: MANUALLY DEFINE JS ROUTES */
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

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

app.get('/main-es5.87df6acd32c7a617d6a9.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/main-es5.87df6acd32c7a617d6a9.js'));
});

app.get('/main-es2015.2e4075064c9c0a026a36.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/main-es2015.2e4075064c9c0a026a36.js'));
});

/* CATCHALL ROUTE: ANGULAR WILL HANDLE THE REST */

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});
app.listen(port, function() {
    console.log('server running on localhost:' + port);
});