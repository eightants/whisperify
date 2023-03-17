import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { TitleTagService } from '../services/title-tag.service';
import { DatastoreService } from '../services/datastore.service';
import { Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';

// function for a random int
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// function to check if a song occurs in an array
const songIsDuplicate = (track, tracks) => {
  for (let j = 0; j < tracks.length; j++) {
    if (track.name == tracks[j].name) {
      if (track.artists[0].name == tracks[j].artists[0].name) {
        return true;
      }
    }
  }
  return false;
};

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuizComponent implements OnInit {
  constructor(
    private router: Router,
    private data: DatastoreService,
    private spotify: SpotifyService,
    private titleTagService: TitleTagService
  ) {}

  token = '';
  pid = '';
  psize = 0;
  offset = [0];
  tracks = [];
  trackprev = [];
  trackopt = [];
  playtracks = [];
  isLoaded = false;
  indexes = [];
  altind = [];
  submitted = false;
  isCorrect = false;
  score = 0;
  mode = '';
  config = {};
  baseScore = 200;
  streak = 0;
  partialArtist = false;
  pointsAdded = 0;
  timePeriodMap = {
    '4 weeks': 'short_term',
    '6 months': 'medium_term',
    Lifetime: 'long_term',
  };
  timePeriod = '6 months';
  trimtracks = [];
  timeLimit = 23;
  // var for challenge
  challengeCode = '';

  // Question Navigation
  // have an array of 10 bools, and an int p keeping track of page
  // when that page is active the bool_arr[p] = true
  // when nextPage() is called p++ and bool_arr updated
  pagesActive = [];
  page = 0;

  maxVolume = 0.5;
  showVolume = false;

  ngOnInit(): void {
    this.titleTagService.setTitle('Quiz - Whisperify');
    this.titleTagService.setSocialMediaTags(
      'Quiz - Whisperify',
      'Quiz yourself on your favourite songs and playlists through 5 second audio snippets! '
    );
    //this.data.currentToken.subscribe(token => this.token = token);
    // alt way to store token, sessionStorage, when quiz is init, get it from storage
    this.baseScore = 200;
    sessionStorage.setItem('sentDB', 'no');
    this.token = sessionStorage.getItem('token');
    this.data.currentConfig.subscribe((configs) => {
      if (configs == 'default') {
        this.router.navigate(['/welcome']);
      } else {
        this.config = configs;
        this.mode = this.config['choice'];
        this.pid = this.config['pid'];
        this.psize = this.config['psize'];
        this.offset = this.config['offset'] || [0];
        this.timePeriod = this.config['timePeriod'];
        // ADJUST baseScore DEPENDING ON CONFIGS
        if (this.config['whisperLen'] == 10) {
          this.baseScore -= 20;
        } else if (this.config['whisperLen'] == 2) {
          this.baseScore += 20;
        }
        if (this.config['multChoice'] == true) {
          this.baseScore -= 60;
        }
      }
    });

    /* TIME LIMIT */
    this.timeLimit = parseInt(this.config['timeLimit']) + 3;

    this.challengeCode = sessionStorage.getItem('challenge');
    if (this.challengeCode != '') {
      this.mode = 'challenge';
      this.data.currentSongs.subscribe((songs) => {
        if (songs == 'default') {
          this.router.navigate(['/challenge', this.challengeCode]);
        } else {
          this.tracks = songs['tracks'];
          if (songs['dynamic'] == true) {
            while (this.indexes.length < 10) {
              const tmpint = getRandomInt(this.tracks.length);
              let unique = true;
              for (let j = 0; j < this.indexes.length; j++) {
                if (this.indexes[j] == tmpint) {
                  unique = false;
                  break;
                }
              }
              if (unique) {
                this.indexes.push(tmpint);
              }
            }
          } else {
            this.indexes = Array.from(Array(10).keys());
          }
          this.data.currentSongList.subscribe((songList) => {
            this.trackopt = songList['tracks'];
            this.data.currentIndexes.subscribe((indList) => {
              if (songs['dynamic'] == true) {
                this.altind = this.indexes.slice();
              } else {
                this.altind = indList['ind'];
              }
              this.isLoaded = true;
            });
          });
        }
      });
    } else {
      if (this.token == '' || this.token == null) {
        this.router.navigate(['/']);
      }
      // get playlist or top tracks depending on the selection
      if (this.mode == 'top') {
        // get request
        this.spotify
          .getTracks(this.token, '0', this.timePeriodMap[this.timePeriod])
          .then((res) => {
            this.spotify
              .getTracks(this.token, '49', this.timePeriodMap[this.timePeriod])
              .then((res2) => {
                //console.log(res);
                this.trackprev = res['items'].concat(res2['items']);

                // DEVELOPMENT; for loop to check the number of valid tracks returned
                for (let i = 0; i < this.trackprev.length; i++) {
                  if (
                    this.trackprev[i].preview_url == null ||
                    this.config['excludeArtists'].includes(
                      this.trackprev[i].artists[0].name
                    )
                  ) {
                    continue;
                  } else {
                    if (!songIsDuplicate(this.trackprev[i], this.tracks)) {
                      this.tracks.push(this.trackprev[i]);
                      this.trackopt.push({
                        artists: [
                          {
                            name: this.trackprev[i].artists[0].name,
                          },
                        ],
                        name: this.trackprev[i].name,
                      });
                    }
                  }
                }
                // checks that more than 10 songs have preview urls
                // generates 10 unique random indexes in the range of the items array returned
                if (this.tracks.length < 20) {
                  // say there's not enough info
                  this.router.navigate(['/no-info']);
                } else {
                  while (this.indexes.length < 10) {
                    const temp = getRandomInt(this.tracks.length);
                    //console.log(this.tracks[temp]);
                    let unique = true;
                    // uniqueness check
                    // check that the url has a preview_url
                    if (this.tracks[temp].preview_url == null) {
                      continue;
                    }
                    for (let j = 0; j < this.indexes.length; j++) {
                      if (this.indexes[j] == temp) {
                        unique = false;
                        break;
                      }
                    }
                    if (unique == true) {
                      this.indexes.push(temp);
                      this.trimtracks.push({
                        album: {
                          images: this.tracks[temp].album.images,
                          name: this.tracks[temp].album.name,
                        },
                        artists: [
                          {
                            name: this.tracks[temp].artists[0].name,
                          },
                        ],
                        external_urls: this.tracks[temp].external_urls,
                        name: this.tracks[temp].name,
                        preview_url: this.tracks[temp].preview_url,
                      });
                    }
                  }
                }
                this.pagesActive = [
                  true,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                ];
                this.page = 0;
                this.altind = this.indexes;
                this.isLoaded = true;
              });
          })
          .catch((e) => {
            console.log(e);
            this.router.navigate(['/']);
          });
      } else if (this.mode === 'saved') {
        const allOffsets = [];
        for (const off of this.offset) {
          allOffsets.push(
            this.spotify.getSavedSongs(this.token, off.toString())
          );
        }
        const getAllSongSamples = Promise.all(allOffsets);

        getAllSongSamples
          .then((values) => {
            this.trackprev = [];
            for (const res of values) {
              this.trackprev.push(...res['items']);
            }

            // DEVELOPMENT; for loop to check the number of valid tracks returned
            for (let i = 0; i < this.trackprev.length; i++) {
              if (this.trackprev[i].track.preview_url == null) {
                continue;
              } else {
                if (!songIsDuplicate(this.trackprev[i].track, this.tracks)) {
                  this.tracks.push(this.trackprev[i].track);
                  this.playtracks.push(this.trackprev[i]);
                  this.trackopt.push({
                    artists: [
                      {
                        name: this.trackprev[i].track.artists[0].name,
                      },
                    ],
                    name: this.trackprev[i].track.name,
                  });
                }
              }
            }

            // checks that more than 10 songs have preview urls
            // generates 10 unique random indexes in the range of the items array returned
            if (this.tracks.length < 20) {
              // say there's not enough info
              this.router.navigate(['/no-info']);
            } else {
              while (this.indexes.length < 10) {
                const temp = getRandomInt(this.tracks.length);
                let unique = true;
                // check that the url has a preview_url
                if (this.tracks[temp].preview_url == null) {
                  continue;
                }
                for (let j = 0; j < this.indexes.length; j++) {
                  if (this.indexes[j] == temp) {
                    unique = false;
                    break;
                  }
                }
                if (unique == true) {
                  this.indexes.push(temp);
                  this.trimtracks.push({
                    album: {
                      images: this.tracks[temp].album.images,
                    },
                    artists: [
                      {
                        name: this.tracks[temp].artists[0].name,
                      },
                    ],
                    external_urls: this.tracks[temp].external_urls,
                    name: this.tracks[temp].name,
                    preview_url: this.tracks[temp].preview_url,
                  });
                }
              }
            }
            this.altind = this.indexes;
            this.isLoaded = true;
          })
          .catch((e) => {
            console.log(e);
            this.router.navigate(['/']);
          });
      } else {
        const allOffsets = [];
        for (const off of this.offset) {
          allOffsets.push(
            this.spotify.getPlaylistTracks(this.pid, this.token, off.toString())
          );
        }
        const getAllSongSamples = Promise.all(allOffsets);

        getAllSongSamples
          .then((values) => {
            this.trackprev = [];
            for (const res of values) {
              this.trackprev.push(...res['items']);
            }
            // DEVELOPMENT; for loop to check the number of valid tracks returned
            for (let i = 0; i < this.trackprev.length; i++) {
              if (this.trackprev[i].track.preview_url == null) {
                continue;
              } else {
                if (!songIsDuplicate(this.trackprev[i].track, this.tracks)) {
                  this.tracks.push(this.trackprev[i].track);
                  this.playtracks.push(this.trackprev[i]);
                  this.trackopt.push({
                    artists: [
                      {
                        name: this.trackprev[i].track.artists[0].name,
                      },
                    ],
                    name: this.trackprev[i].track.name,
                  });
                }
              }
            }

            // checks that more than 10 songs have preview urls
            // generates 10 unique random indexes in the range of the items array returned
            if (this.tracks.length < 20) {
              // say there's not enough info
              this.router.navigate(['/no-info']);
            } else {
              while (this.indexes.length < 10) {
                const temp = getRandomInt(this.tracks.length);
                let unique = true;
                // check that the url has a preview_url
                if (this.tracks[temp].preview_url == null) {
                  continue;
                }
                for (let j = 0; j < this.indexes.length; j++) {
                  if (this.indexes[j] == temp) {
                    unique = false;
                    break;
                  }
                }
                if (unique == true) {
                  this.indexes.push(temp);
                  this.trimtracks.push({
                    album: {
                      images: this.tracks[temp].album.images,
                    },
                    artists: [
                      {
                        name: this.tracks[temp].artists[0].name,
                      },
                    ],
                    external_urls: this.tracks[temp].external_urls,
                    name: this.tracks[temp].name,
                    preview_url: this.tracks[temp].preview_url,
                  });
                }
              }
            }
            this.altind = this.indexes;
            this.isLoaded = true;
          })
          .catch((e) => {
            console.log(e);
            this.router.navigate(['/']);
          });
      }
    }
  }

  nextPage() {
    this.submitted = false;
    // checks if quiz is done
    if (this.page >= 9) {
      sessionStorage.setItem('score', this.score.toString());
      if (this.challengeCode != '') {
        this.router.navigate(['/results', this.challengeCode]);
      } else {
        this.data.changeSongs(this.trimtracks);
        this.data.changeSongList(this.trackopt);
        this.data.changeIndexes(this.indexes);
        this.router.navigate(['/results']);
      }
    }
    this.page++;
    this.pagesActive[this.page - 1] = false;
    this.pagesActive[this.page] = true;
  }

  handleVolume(value) {
    this.maxVolume = value;
  }

  /* AUDIO CODE */

  // function to generate dummy preview_audio links
  generatePreview(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz123456789012345678901234567890';
    let ret = '';
    for (let i = 0; i < 40; i++) {
      ret += chars[getRandomInt(chars.length)];
    }
    return (
      'https://p.scdn.co/mp3-preview/' +
      ret +
      '?cid=2807cec683222615b00a93r6e24f375c'
    );
  }

  // gets the audio DOM element
  @ViewChild('musicAudio', { static: false }) source;
  @ViewChild('blueWave', { static: false }) blueWave;

  stopAudio() {
    this.source.nativeElement.load();
    this.blueWave.nativeElement.classList.remove(
      'animate-wave',
      'animate-wave-long',
      'blue-finished',
      'animate-wave-short'
    );
  }
  playAudio() {
    if (
      !this.source.nativeElement.paused ||
      (this.source.nativeElement.currentTime > 0 &&
        this.source.nativeElement.currentTime < 0)
    ) {
      // do nothing
    } else {
      this.source.nativeElement.load();
      this.source.nativeElement.play();
      // adds the animation to bluewave
      if (this.config['whisperLen'] > 5) {
        this.blueWave.nativeElement.classList.add(
          'animate-wave-long',
          'blue-finished'
        );
      } else if (this.config['whisperLen'] == 2) {
        this.blueWave.nativeElement.classList.add(
          'animate-wave-short',
          'blue-finished'
        );
      } else {
        this.blueWave.nativeElement.classList.add(
          'animate-wave',
          'blue-finished'
        );
      }
      // console.log(this.source.nativeElement);
      this.startTimer();
      this.getSoundAndFadeAudio();
    }
  }
  getSoundAndFadeAudio() {
    const sound = this.source.nativeElement;
    const wave = this.blueWave.nativeElement;
    sound.volume = 0;
    // Set the point in playback that fadeout begins. This is for a 1 second fade in and fade out.
    const fadeIn = 0;
    const currMaxVolume = this.maxVolume;
    // No audio fading when whisperLen is 2
    if (this.config['whisperLen'] == 2) {
      sound.volume = currMaxVolume;
    }
    const fadeInAudio = setInterval(function () {
      // Only fade if past the fade out point or not at zero already
      if (sound.currentTime >= fadeIn && sound.volume < currMaxVolume) {
        try {
          sound.volume += currMaxVolume / 10;
        } catch (TypeError) {
          clearInterval(fadeInAudio);
        }
      }
      // When volume at 1 stop all the intervalling
      else if (sound.volume >= currMaxVolume) {
        clearInterval(fadeInAudio);
      }
    }, 100);
    /* WHISPER LENGTH */
    const fadePoint = this.config['whisperLen'] - 1;
    const fadeAudio = setInterval(function () {
      // Only fade if past the fade out point or not at zero already
      if (sound.currentTime >= fadePoint && sound.volume > 0.0) {
        try {
          sound.volume -= currMaxVolume / 10;
        } catch (TypeError) {
          wave.classList.remove(
            'animate-wave',
            'animate-wave-long',
            'animate-wave-short'
          );
          clearInterval(fadeAudio);
          sound.pause();
        }
      }
      if (sound.currentTime >= fadePoint + 2 && sound.volume > 0.0) {
        clearInterval(fadeAudio);
        sound.pause();
      }
    }, 100);
  }

  checkAns(submission, ans) {
    this.stopAudio();
    this.endTimer();
    if (this.submitted) {
        this.nextPage();
    }
    this.submitted = true;
    this.partialArtist = false;
    // checks answer after getting thing from event emitter
    if (submission == ans.artists[0].name + ' - ' + ans.name) {
      this.isCorrect = true;
      // Time for streaks!
      this.streak += 1;
      // For every 2 questions correct, score obtained is multipled by extra 5%
      const multiplier = 1 + Math.floor(this.streak / 2) * 0.05;
      this.score += Math.floor(this.baseScore * this.prevTime * multiplier);
      this.pointsAdded = Math.floor(
        this.baseScore * this.prevTime * multiplier
      );
    } else {
      this.isCorrect = false;
      this.streak = 0;
      // Maybe you got the artist right?
      const submittedArtist = submission.split('-')[0].split(' ');
      const ansArtist = ans.artists[0].name.split(' ');
      let partial = false;
      submittedArtist.forEach((subword) => {
        ansArtist.forEach((answord) => {
          if (subword == answord) {
            partial = true;
          }
        });
      });
      if (partial) {
        this.score += Math.floor(this.baseScore * this.prevTime * 0.5);
        this.pointsAdded = Math.floor(this.baseScore * this.prevTime * 0.5);
        this.partialArtist = true;
      } else {
        this.pointsAdded = 0;
      }
    }
  }

  /* TIMER CODE */
  // variable to keep track of time taken to answer question
  timerStarted = false;
  prevTime = 0;
  timet = 0;
  incrementTime;

  startTimer() {
    if (this.timerStarted != true) {
      // increments timer depending on values, and automatic expiry
      setTimeout(() => {
        this.timerStarted = true;
        this.incrementTime = setInterval(() => {
          if (this.timet < this.timeLimit && this.timerStarted == true) {
            this.timet += 1;
            if (this.timet % 2 == 1) {
              this.circlePulse();
            }
          } else if (
            this.timet >= this.timeLimit &&
            this.timerStarted == true
          ) {
            this.checkAns('Timer', {
              name: 'dummy',
              artists: [{ name: 'dummy' }],
            });
          }
        }, 1000);
      }, 500);
    }
  }

  endTimer() {
    this.timerStarted = false;
    clearInterval(this.incrementTime);
    if (this.timet <= 1) {
      this.prevTime = 1;
    } else if (this.timet <= 21) {
      this.prevTime = 1 - (this.timet - 1) / 25;
    } else if (this.timet > 21) {
      this.prevTime = 0.2;
    }
    this.timet = 0;
  }

  cycle = [0, 0, 0, 0];
  circleLoop;

  /* pulsing effect on timer */
  circlePulse() {
    let curr = 0;
    this.cycle[curr] = 1;
    this.circleLoop = setInterval(() => {
      curr += 1;
      if (curr >= 4) {
        this.cycle[curr - 1] = 0;
        clearInterval(this.circleLoop);
      } else {
        this.cycle[curr] = 1;
        this.cycle[curr - 1] = 0;
      }
    }, 250);
  }

  /* used in ngIf to show or hide circles as timer counts down */
  timeLess(num) {
    let compnum = num;
    if (this.timeLimit > 25) {
      compnum = num * 2;
    }
    if (this.timet < compnum) {
      return true;
    } else {
      return false;
    }
  }
}
