# Whisperify

![Landing Page](https://whisperify.net/assets/landing.png)

How well do you know your favourite songs? Whisperify is an interactive way to learn about your favourite songs. It chooses 10 songs from your top tracks or a playlist on Spotify, and plays you 5-second snippets, or 'whispers', of each song. You then get time to guess the song and get scored on your speed and accuracy. 

One of my favourite songs is Careless Whisper by George Michael. Interestingly, all most people needed was the first two seconds of the opening drum riff to recognise Careless Whisper. That was the main inspiration behind Whisperify. 

There is something about song identification that makes an interesting pasttime and my friends have always enjoyed quizzing each other on our music. This pushed me to figure out the ideal length of a song snippet that would allow you to identify a song, and how to get a metric for performance. 

Whisperify is built with Angular, NodeJS, and hosted on Now with a MongoDB database to compare your score against others. 

[[Visit Whisperify]](https://whisperify.net)

## Release Notes
* v0.8.0 - First hosted on Now. (18/01/2020)
* v0.9.0 - Made responsive, style improvements on welcome page. (09/02/2020)
* v1.0.0 - Metadata added, share functionality. (11/02/2020)
* v1.1.0 - Survey implementation, made public. (27/02/2020)
* v2.0.0 - Playlist quiz feature. You can now generate a quiz from one of your playlists with at least 30 songs! (08/03/2020)
* v2.0.1 - Fixed IOS audio bug. Disabled submit with blank input. Database optimizations. 

## Future Plans
* Handling non-latin characters in song titles
* Customize quiz settings
* Better scoring system with partial points for artists
* Send your quiz to friends
* Live collaborative song guessing
* Brand new features to learn even more about your listening habits