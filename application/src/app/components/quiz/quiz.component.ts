import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  Directive,
} from "@angular/core";
import { TitleTagService } from "../services/title-tag.service";
import { DatastoreService } from "../services/datastore.service";
import { Router } from "@angular/router";
import { SpotifyService } from "../services/spotify.service";

// function for a random int
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

@Component({
  selector: "app-quiz",
  templateUrl: "./quiz.component.html",
  styleUrls: ["./quiz.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class QuizComponent implements OnInit {
  constructor(
    private router: Router,
    private data: DatastoreService,
    private spotify: SpotifyService,
    private titleTagService: TitleTagService
  ) {}

  token = "";
  pid = "";
  psize = 0;
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
  mode = "";
  config = {};
  baseScore = 200;
  streak = 0;
  partialArtist = false;
  pointsAdded = 0;
  timePeriodMap = {
    "4 weeks": "short_term",
    "6 months": "medium_term",
    Lifetime: "long_term",
  };
  timePeriod = "6 months";
  trimtracks = [];
  timeLimit = 23;
  // var for challenge
  challengeCode = "";

  maxVolume = 0.8;
  showVolume = false;

  ngOnInit() {
    this.titleTagService.setTitle("Quiz - Whisperify");
    this.titleTagService.setSocialMediaTags(
      "Quiz - Whisperify",
      "Quiz yourself on your favourite songs and playlists through 5 second audio snippets! "
    );
    //this.data.currentToken.subscribe(token => this.token = token);
    // alt way to store token, sessionStorage, when quiz is init, get it from storage
    this.baseScore = 200;
    sessionStorage.setItem("sentDB", "no");
    this.token = sessionStorage.getItem("token");
    this.data.currentConfig.subscribe((configs) => {
      if (configs == "default") {
        this.router.navigate(["/welcome"]);
      } else {
        this.config = configs;
        this.mode = this.config["choice"];
        this.pid = this.config["pid"];
        this.psize = this.config["psize"];
        this.timePeriod = this.config["timePeriod"];
        // ADJUST baseScore DEPENDING ON CONFIGS
        if (this.config["whisperLen"] == 10) {
          this.baseScore -= 20;
        } else if (this.config["whisperLen"] == 2) {
          this.baseScore += 20;
        }
        if (this.config["multChoice"] == true) {
          this.baseScore -= 60;
        }
      }
    });
    //console.log("basescore" + this.baseScore);
    /* TIME LIMIT */
    this.timeLimit = parseInt(this.config["timeLimit"]) + 3;
    //console.log(this.token);

    this.challengeCode = sessionStorage.getItem("challenge");
    //console.log(this.challengeCode);
    if (this.challengeCode != "") {
      this.mode = "challenge";
      this.data.currentSongs.subscribe((songs) => {
        if (songs == "default") {
          this.router.navigate(["/challenge", this.challengeCode]);
        } else {
          this.tracks = songs["tracks"];
          if (songs["dynamic"] == true) {
            while (this.indexes.length < 10) {
              let tmpint = getRandomInt(this.tracks.length);
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
            //console.log(this.indexes)
          } else {
            this.indexes = Array.from(Array(10).keys());
          }
          //console.log(this.indexes)
          this.data.currentSongList.subscribe((songList) => {
            this.trackopt = songList["tracks"];
            this.data.currentIndexes.subscribe((indList) => {
              if (songs["dynamic"] == true) {
                this.altind = this.indexes.slice();
              } else {
                this.altind = indList["ind"];
              }
              //console.log(this.altind)
              this.isLoaded = true;
            });
          });
        }
      });
    } else {
      if (this.token == "" || this.token == null) {
        this.router.navigate(["/"]);
      }
      // get playlist or top tracks depending on the selection
      if (this.mode == "top") {
        // get request
        this.spotify
          .getTracks(this.token, "0", this.timePeriodMap[this.timePeriod])
          .then((res) => {
            this.spotify
              .getTracks(this.token, "49", this.timePeriodMap[this.timePeriod])
              .then((res2) => {
                //console.log(res);
                this.trackprev = res["items"].concat(res2["items"]);

                // DEVELOPMENT; for loop to check the number of valid tracks returned
                for (let i = 0; i < this.trackprev.length; i++) {
                  if (
                    this.trackprev[i].preview_url == null ||
                    this.config["excludeArtists"].includes(
                      this.trackprev[i].artists[0].name
                    )
                  ) {
                  } else {
                    // checks for duplicate tracks (thanks spotify for multiple versions of the same track)
                    let duplicate = false;
                    for (let j = 0; j < this.tracks.length; j++) {
                      if (this.trackprev[i].name == this.tracks[j].name) {
                        if (
                          this.trackprev[i].artists[0].name ==
                          this.tracks[j].artists[0].name
                        ) {
                          //console.log("DUP", this.trackprev[i].name)
                          duplicate = true;
                          break;
                        }
                      }
                    }
                    if (duplicate == false) {
                      //console.log(this.trackprev[i].name)
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
                  this.router.navigate(["/no-info"]);
                } else {
                  while (this.indexes.length < 10) {
                    let temp = getRandomInt(this.tracks.length);
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
                //console.log(this.pagesActive)
                this.altind = this.indexes;
                this.isLoaded = true;
              });
          })
          .catch((e) => {
            console.log(e);
            this.router.navigate(["/"]);
          });
      } else {
        let off = 0;
        if (this.psize > 100) {
          off = getRandomInt(this.psize - 100);
        }
        this.spotify
          .getPlaylistTracks(this.pid, this.token, off.toString())
          .then((res) => {
            this.trackprev = res["items"];

            // DEVELOPMENT; for loop to check the number of valid tracks returned
            for (let i = 0; i < this.trackprev.length; i++) {
              if (this.trackprev[i].track.preview_url == null) {
              } else {
                // checks for duplicate tracks (thanks spotify for multiple versions of the same track)
                let duplicate = false;
                for (let j = 0; j < this.tracks.length; j++) {
                  if (this.trackprev[i].track.name == this.tracks[j].name) {
                    if (
                      this.trackprev[i].track.artists[0].name ==
                      this.tracks[j].artists[0].name
                    ) {
                      duplicate = true;
                      break;
                    }
                  }
                }
                if (duplicate == false) {
                  //console.log(this.trackprev[i].name)
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
            //console.log(this.tracks.length)

            // checks that more than 10 songs have preview urls
            // generates 10 unique random indexes in the range of the items array returned
            if (this.tracks.length < 20) {
              // say there's not enough info
              this.router.navigate(["/no-info"]);
            } else {
              while (this.indexes.length < 10) {
                let temp = getRandomInt(this.tracks.length);
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
            //console.log(this.pagesActive)
            this.altind = this.indexes;
            this.isLoaded = true;
          })
          .catch((e) => {
            console.log(e);
            this.router.navigate(["/"]);
          });
      }
    }
  }

  // generating quiz questions
  // save score in session storage

  // Question Navigation
  // have an array of 10 bools, and an int p keeping track of page
  // when that page is active the bool_arr[p] = true
  // when nextPage() is called p++ and bool_arr updated
  pagesActive = [];
  page = 0;

  nextPage() {
    // clears overlay
    this.submitted = false;
    // checks if quiz is done
    if (this.page >= 9) {
      sessionStorage.setItem("score", this.score.toString());
      if (this.challengeCode != "") {
        this.router.navigate(["/results", this.challengeCode]);
      } else {
        //console.log(this.tracks);
        this.data.changeSongs(this.trimtracks);
        this.data.changeSongList(this.trackopt);
        this.data.changeIndexes(this.indexes);
        this.router.navigate(["/results"]);
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
  generatePreview() {
    var chars = "abcdefghijklmnopqrstuvwxyz123456789012345678901234567890";
    //var ex = "https://p.scdn.co/mp3-preview/01c9683137537772861eff821c08166eacb06301?cid=2847cfc683244615b79a93a6e24f375c"
    var ret = "";
    for (var i = 0; i < 40; i++) {
      ret += chars[getRandomInt(chars.length)];
    }
    return (
      "https://p.scdn.co/mp3-preview/" +
      ret +
      "?cid=2807cec683222615b00a93r6e24f375c"
    );
  }

  // gets the audio DOM element
  @ViewChild("musicAudio", { static: false }) source;
  @ViewChild("blueWave", { static: false }) blueWave;

  stopAudio() {
    this.source.nativeElement.load();
    this.blueWave.nativeElement.classList.remove(
      "animate-wave",
      "animate-wave-long",
      "blue-finished",
      "animate-wave-short"
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
      if (this.config["whisperLen"] > 5) {
        this.blueWave.nativeElement.classList.add(
          "animate-wave-long",
          "blue-finished"
        );
      } else if (this.config["whisperLen"] == 2) {
        this.blueWave.nativeElement.classList.add(
          "animate-wave-short",
          "blue-finished"
        );
      } else {
        this.blueWave.nativeElement.classList.add(
          "animate-wave",
          "blue-finished"
        );
      }
      // console.log(this.source.nativeElement);
      this.startTimer();
      this.getSoundAndFadeAudio();
    }
  }
  getSoundAndFadeAudio() {
    var sound = this.source.nativeElement;
    var wave = this.blueWave.nativeElement;
    sound.volume = 0;
    // Set the point in playback that fadeout begins. This is for a 1 second fade in and fade out.
    var fadeIn = 0;
    var currMaxVolume = this.maxVolume;
    var fadeInAudio = setInterval(function () {
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
    var fadePoint = this.config["whisperLen"] - 1;
    var fadeAudio = setInterval(function () {
      // Only fade if past the fade out point or not at zero already
      if (sound.currentTime >= fadePoint && sound.volume > 0.0) {
        try {
          sound.volume -= currMaxVolume / 10;
        } catch (TypeError) {
          wave.classList.remove(
            "animate-wave",
            "animate-wave-long",
            "animate-wave-short"
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
    this.submitted = true;
    this.partialArtist = false;
    // checks answer after getting thing from event emitter
    if (submission == ans.artists[0].name + " - " + ans.name) {
      this.isCorrect = true;
      // Time for streaks!
      this.streak += 1;
      // every 2 questions right, score obtained is multipled by extra 5%
      let multiplier = 1 + Math.floor(this.streak / 2) * 0.05;
      //console.log(multiplier);
      this.score += Math.floor(this.baseScore * this.prevTime * multiplier);
      this.pointsAdded = Math.floor(
        this.baseScore * this.prevTime * multiplier
      );
      //console.log(submission + " = " + ans.artists[0].name + " - " + ans.name);
      //console.log("score: " + this.score);
    } else {
      this.isCorrect = false;
      this.streak = 0;
      // Maybe you got the artist right?
      let submittedArtist = submission.split("-")[0].split(" ");
      let ansArtist = ans.artists[0].name.split(" ");
      let partial = false;
      submittedArtist.forEach((subword) => {
        ansArtist.forEach((answord) => {
          //console.log(subword + "=" + answord);
          if (subword == answord) {
            partial = true;
          }
        });
      });
      if (partial) {
        this.score += Math.floor(this.baseScore * this.prevTime * 0.5);
        this.pointsAdded = Math.floor(this.baseScore * this.prevTime * 0.5);
        //console.log("partial" + Math.floor(100 * this.prevTime));
        this.partialArtist = true;
      } else {
        this.pointsAdded = 0;
      }
      //console.log(submission + " != " + ans.artists[0].name + " - " + ans.name);
      //console.log("score: " + this.score);
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
      // fixing scope of this.
      var _this = this;
      // increments timer depending on values, and automatic expiry
      setTimeout(function () {
        _this.timerStarted = true;
        _this.incrementTime = setInterval(() => {
          //console.log(_this.timet, _this.timerStarted)
          if (_this.timet < _this.timeLimit && _this.timerStarted == true) {
            _this.timet += 1;
            if (_this.timet % 2 == 1) {
              _this.circlePulse();
            }
          } else if (
            _this.timet >= _this.timeLimit &&
            _this.timerStarted == true
          ) {
            _this.submitted = true;
            _this.isCorrect = false;
            _this.endTimer();
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
    var curr = 0;
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
    var compnum = num;
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
