import { Component, OnInit, ViewEncapsulation, ViewChild, Directive, wtfEndTimeRange } from '@angular/core';
import { DatastoreService } from '../services/datastore.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SpotifyService } from '../services/spotify.service';

// function for a random int
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

@Directive({selector: 'audioMusic'})
class AudioDir {}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  encapsulation: ViewEncapsulation.None,  
})
export class QuizComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router, private data: DatastoreService, private spotify: SpotifyService) { }

  token = "";
  tracks = [];
  trackprev = [];
  isLoaded = false;
  indexes = []
  submitted = false;
  isCorrect = false;
  score = 0;
 

  ngOnInit() {
    //this.data.currentToken.subscribe(token => this.token = token);
    // alt way to store token, sessionStorage, when quiz is init, get it from storage
    sessionStorage.setItem("sentDB", "no");
    this.token = sessionStorage.getItem("token");
    //console.log(this.token);
    if (this.token == "" || this.token == null) {
      this.router.navigate(["/"]);
    }
    // get request
      this.spotify.getTracks(this.token, "0").then(
        res => {
          this.spotify.getTracks(this.token, "49").then(
            res2 => {
          //console.log(res);
          this.trackprev = res['items'].concat(res2["items"]);

          // DEVELOPMENT; for loop to check the number of valid tracks returned
          for (let i = 0; i < this.trackprev.length; i++) {
            if (this.trackprev[i].preview_url == null) {
              //console.log("huh")
            } else {
              // checks for duplicate tracks (thanks spotify for multiple versions of the same track)
              let duplicate = false;
              for (let j = 0; j < this.tracks.length; j++) {
                if (this.trackprev[i].name == this.tracks[j].name) {
                  if (this.trackprev[i].artists[0].name == this.tracks[j].artists[0].name) {
                    //console.log("DUP", this.trackprev[i].name)
                    duplicate = true;
                    break;
                  }
                }
              }
              if (duplicate == false) {
                //console.log(this.trackprev[i].name)
                this.tracks.push(this.trackprev[i]);
              }
            }
          }
          //console.log(this.tracks.length)
          // checks that more than 10 songs have preview urls
          // generates 10 unique random indexes in the range of the items array returned
          if (this.tracks.length < 20) {
            // say there's not enough info
            this.router.navigate(["/no-info"]);
          }
          else {
            while (this.indexes.length < 10) {
              let temp = getRandomInt(this.tracks.length);
              //console.log(this.tracks[temp]);
              let unique = true;
              // uniqueness check
              // check that the url has a preview_url
              if (this.tracks[temp].preview_url == null) {
                continue
              }
              for (let j = 0; j < this.indexes.length; j++) {
                if (this.indexes[j] == temp) {
                  unique = false;
                  break;
                }
              }
              if (unique == true) {
                this.indexes.push(temp);
              }
            }
          }
          this.pagesActive = [true, false, false, false, false, false, false, false, false, false]
          this.page = 0
          //console.log(this.pagesActive)
          this.isLoaded = true;
        })
        }
      ).catch((e) => {
        console.log(e);
      this.router.navigate(["/"]);
      });
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
      this.router.navigate(["/results"]);
    }
    this.page++;
    this.pagesActive[this.page - 1] = false;
    this.pagesActive[this.page] = true;
  }
  


  /* AUDIO CODE */

  // function to generate dummy preview_audio links
  generatePreview() {
    var chars = "abcdefghijklmnopqrstuvwxyz123456789012345678901234567890"
    //var ex = "https://p.scdn.co/mp3-preview/01c9683137537772861eff821c08166eacb06301?cid=2847cfc683244615b79a93a6e24f375c"
    var ret = ""
    for (var i = 0; i < 40; i++) {
      ret += chars[getRandomInt(chars.length)];
    }
    return ("https://p.scdn.co/mp3-preview/" + ret + "?cid=2807cec683222615b00a93r6e24f375c")
  }


  // gets the audio DOM element
  @ViewChild('musicAudio', {static: false}) source;
  @ViewChild('blueWave', {static: false}) blueWave;

  stopAudio() {
    this.source.nativeElement.load();
    this.blueWave.nativeElement.classList.remove('animate-wave','blue-finished');
  }
  playAudio() {
    if (!this.source.nativeElement.paused || (this.source.nativeElement.currentTime > 0 && this.source.nativeElement.currentTime < 0)) {
      // do nothing
    } else {
      this.source.nativeElement.load();
      this.source.nativeElement.play();
      // adds the animation to bluewave
      this.blueWave.nativeElement.classList.add('animate-wave', 'blue-finished');
      // console.log(this.source.nativeElement);
      this.startTimer();
      this.getSoundAndFadeAudio();
    }
  }
  getSoundAndFadeAudio () {
    var sound = this.source.nativeElement;
    var wave = this.blueWave.nativeElement;
    sound.volume = 0;
    // Set the point in playback that fadeout begins. This is for a 1 second fade in and fade out.
    var fadeIn = 0;
    var fadeInAudio = setInterval(function () {
      // Only fade if past the fade out point or not at zero already
      if ((sound.currentTime >= fadeIn) && (sound.volume < 1.0)) {
            try {
              sound.volume += 0.1;
            }
            catch (TypeError) {
              clearInterval(fadeInAudio);
            }
      }
      // When volume at 1 stop all the intervalling
      else if (sound.volume >= 1.0) {
            clearInterval(fadeInAudio);
      }
    }, 100);
    var fadePoint = /* sound end duration */ 4; 
    var fadeAudio = setInterval(function () {
        // Only fade if past the fade out point or not at zero already
        if ((sound.currentTime >= fadePoint) && (sound.volume > 0.0)) {
            try {
              sound.volume -= 0.1;
            }
            catch (TypeError) {
              wave.classList.remove('animate-wave');
              clearInterval(fadeAudio);
              sound.pause();
            }
        }
    }, 100);
  }

  checkAns(submission, ans) {
    this.endTimer();
    this.submitted = true;
    // checks answer after getting thing from event emitter
    if (submission == ans.artists[0].name + " - " + ans.name) {
      this.isCorrect = true;
      this.score += Math.floor(200 * this.prevTime);
      //console.log(submission + " = " + ans.artists[0].name + " - " + ans.name);
      //console.log("score: " + this.score);
    } else {
      this.isCorrect = false;
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
      setTimeout(function() {
        _this.timerStarted = true;
        _this.incrementTime = setInterval(() => {
          //console.log(_this.timet, _this.timerStarted)
          if (_this.timet < 23 && _this.timerStarted == true) {
            _this.timet += 1;
            if (_this.timet % 2 == 1) {
              _this.circlePulse();
            }
          } else if (_this.timet >= 23 && _this.timerStarted == true) {
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
    if (this.timet <= 3) {
      this.prevTime = 1;
    } else if (this.timet > 3) {
      this.prevTime = 1 - (this.timet - 3) / 25;
    }
    this.timet = 0;
  }


  cycle = [0,0,0,0]
  circleLoop;

  /* pulsing effect on timer */
  circlePulse() {
    var curr = 0;
    this.cycle[curr] = 1;
    this.circleLoop = setInterval(()=> {
      curr += 1
      if (curr >= 4) {
        this.cycle[curr-1] = 0;
        clearInterval(this.circleLoop);
      } else {
        this.cycle[curr] = 1;
        this.cycle[curr-1] = 0;
      }
    }, 250);
  }


  /* used in ngIf to show or hide circles as timer counts down */
  timeLess(num) {
    if (this.timet < num) {
      return true;
    } else {
      return false;
    }
  }
}
