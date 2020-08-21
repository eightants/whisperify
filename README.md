<h3 align="center"><!--<img src="https://i.imgur.com/zBxrTgI.png" width="600px" style="border-radius: 5px" alt="Whisperify">--></h3>
<p align="center">
  <a href="https://whisperify.net" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/try_it_out-whisperify.net-0099FF.svg"></a>
  <a href="https://github.com/eightants/whisperify/releases/latest"><img src="https://img.shields.io/github/release/eightants/whisperify/all.svg?colorB=38a275?label=version"></a>
  <a href="https://reddit.com/r/whisperify" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/join%20the%20community-on%20reddit-FF5700.svg"></a>
  <a href="https://ko-fi.com/eightants" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/buy_me_a-coffee-ff69b4.svg"></a>
</p>
<p align="center">
  <img src="https://img.shields.io/endpoint?url=https://whisperify.net/api/averagescore/all">
  <img src="https://img.shields.io/endpoint?url=https://whisperify.net/api/countchallenges">
</p>

<img src="https://i.imgur.com/gMb8Tzj.png" alt="img" align="right" width="250px" alt="Your music insight">

An interactive way to learn about your favourite songs on Spotify. Quiz yourself on your favourite playlists, create and share quizzes with friends, and compare listening habits through your personalities. 

Whisperify chooses 10 songs from your top tracks or a playlist on Spotify, and plays you 5-second snippets, or 'whispers', of each song. You then get time to guess the song and get scored on your speed and accuracy. 

Whisperify Analysis is the most complete visualization dashboard for Spotify audio features. Compare your listening habits with Spotify users from over 70 countries and the 16 Meyer-Briggs personalities, try analysing your favourite albums, or view a breakdown of your friends' tastes. 

Whisperify is built with Angular, NodeJS, and hosted on Vercel with a MongoDB database. 

## Public API
As an open-source project, Whisperify is dedicated to give back. A public API is currently under works to provide endpoints to access audio feature analysis for Spotify users in over 70 countries and 16 personalities. Other endpoints are wrappers for the Spotify API combined with Whisperify's features: getting audio features for an album, getting clusters of genres for a user or artist, getting a recreated taste profile of a user. 

[Read the detailed API reference to learn more about the endpoints](https://whisperify.net/documentation/reference). 

## Development
Whisperify is made up of two projects, an Angular frontend and a Node backend. Clone this repository to your local machine, then run `npm i` in both `/application` and `/server` to install all required packages. [Read the documentation](https://whisperify.net/documentation/getting-started) to set up the configurations. 

Certain features in Whisperify make use of machine learning. The case study behind those features can be found in the [sub-project Carlos](https://github.com/eightants/carlos). 

## Pre-release Notes
* v0.8.0 - First hosted. (18/01/2020)
* v0.9.0 - Made responsive, style improvements on welcome page. (09/02/2020)
* v0.9.1 - Metadata added, share functionality. (11/02/2020)
* v1.0.0 - Survey implementation, public release. (27/02/2020)

## Future Plans
* Live collaborative song guessing
* Leaderboard and badges
* Brand new features to learn even more about your listening habits

To prioritise the development of any of these features, start a discussion on r/whisperify. 
