# Getting Started
Whisperify is made up of two projects, an Angular frontend and a Node backend. As an open source project, you can contribute to Whisperify by forking the repository, developing a feature or improvement, then making a pull request. 

This documentation page will help you set up your coding environment for development. You need to have [NodeJS](https://nodejs.org/en/download/) installed. Whisperify uses Node v12.14.0 and npm v6.13.4, and is developed on Angular v8.0.6. 

<br>

<h2 id="cloning-the-repository">Cloning the repository</h2>

Clone the [repository](https://github.com/eightants/whisperify.git) to your local machine, then run `npm i` in both `/application` and `/server` to install all required packages. 
```
$ git clone https://github.com/eightants/whisperify.git
$ cd application
$ npm i
$ cd ../server
$ npm i
```

<br>

<h2 id="creating-a-spotify-app">Creating a Spotify app</h2>

To run Whisperify with full functionality, Spotify authentication is required. You need to register your own Spotify keys to use Whisperify locally. 

1. Login to your [Spotify Dashboard](https://developer.spotify.com/dashboard/) and click **Create an App**
2. Give your app a name and description, accept the terms, and click **Create**
3. The app view will open. Click on **Edit Settings** and add `http://localhost:8888/callback/` to the *Redirect URIs* field. 

More detailed instructions can be found on the [Spotify Developers page](https://developer.spotify.com/documentation/general/guides/app-settings/)

<br>

<h2 id="changing-user-variables">Changing user variables</h2>

In `/server/mock.js`, change `<YOUR APP ID>` and `<YOUR APP SECRET>` to the ones from your Spotify app. If you used a different *Redirect URI* from the last step, change `redirect_uri` to the URL you used. 
```javascript
// TODO: YOUR APP CLIENT ID AND SECRET HERE
var client_id = "<YOUR APP ID>"; 
var client_secret = "<YOUR APP SECRET>";
===== CHANGE TO =====
// These are dummy strings, you should use the ones from your app
var client_id = "dniiu324nu3y44iu3y4u3c2a35f4acb"; 
var client_secret = "bb1b2c8b78854d1fac2a3bcb705f4acb";
```

In `application/global.ts`, comment out line 15 and uncomment line 16. 
```typescript
// export const MAINURL = "http://localhost:8888/";
export const MAINURL = 'https://whisperify.net/';
===== CHANGE TO =====
export const MAINURL = "http://localhost:8888/";
// export const MAINURL = 'https://whisperify.net/';
```

Add `/server` to your `.gitignore` file to avoid committing your API keys. 

<br>

<h2 id="running-the-project">Running the project</h2>

Now, run `node mock.js` in `/server` to start the Node server. Open another terminal, run `npm start` in `/application` to start the Angular app. Whisperify should be working locally at `http://localhost:4200`. 

<br>