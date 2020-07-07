<h3 align="center"><img src="https://i.imgur.com/zBxrTgI.png" width="600px" style="border-radius: 5px" alt="Whisperify"></h3>
<p align="center">
  <a href="https://whisperify.net" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/try_it_out-whisperify.net-0099FF.svg"></a>
  <a href="https://github.com/eightants/whisperify/releases/latest"><img src="https://img.shields.io/github/release/eightants/whisperify/all.svg?colorB=38a275?label=version"></a>
  <a href="https://reddit.com/r/whisperify" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/join%20the%20community-on%20reddit-FF5700.svg"></a>
  <a href="https://www.buymeacoffee.com/eightants" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/buy_me_a-coffee-ff69b4.svg"></a>
</p>
<p align="center">
  <img src="https://img.shields.io/endpoint?url=https://whisperify.net/api/averagescore/all">
  <img src="https://img.shields.io/endpoint?url=https://whisperify.net/api/countchallenges">
</p>

An interactive way to learn about your favourite songs on Spotify. Quiz yourself on your favourite playlists, create and share quizzes with friends, and compare listening habits through your personalities. 

Whisperify chooses 10 songs from your top tracks or a playlist on Spotify, and plays you 5-second snippets, or 'whispers', of each song. You then get time to guess the song and get scored on your speed and accuracy. 

Whisperify Analysis

Whisperify is built with Angular, NodeJS, and hosted on Vercel with a MongoDB database. 

## Pre-release Notes
* v0.8.0 - First hosted. (18/01/2020)
* v0.9.0 - Made responsive, style improvements on welcome page. (09/02/2020)
* v0.9.1 - Metadata added, share functionality. (11/02/2020)
* v1.0.0 - Survey implementation, public release. (27/02/2020)

## Future Plans
* Live collaborative song guessing
* Brand new features to learn even more about your listening habits

To prioritise the development of any of these features, start a discussion on r/whisperify. 

## Public API
As an open-source project, Whisperify is dedicated to give back. A public API is currently under works to provide endpoints to access audio feature analysis for Spotify users in over 70 countries and 16 personalities. Other endpoints are wrappers for the Spotify API combined with Whisperify's features: getting audio features for an album, getting clusters of genres for a user or artist, getting a recreated taste profile of a user. 

Current available endpoints are below. Base URL: `https://whisperify.net/api`
* GET `/api/features/group/:category` will provide audio analysis for a group of users. Current supported categories are `all`, `country`, and `personality`. The plan is to allow more fine grain queries for specific countries and personalities. 
* GET `/api/features/user/:username` will provide audio analysis for a user if they are on Whisperify. 
* GET `/api/features/album/:album_id/:token` will provide audio analysis for an album on Spotify. `album_id` is the Spotify `id` of the album and `token` is the provided Spotify access token from the API, using one of the three authorization flows. 
