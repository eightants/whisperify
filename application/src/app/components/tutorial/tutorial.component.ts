import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'], 
})
export class TutorialComponent implements OnInit {

  constructor(private router: Router) { }

  ind = 0;
  /* example track item object simulated */

  examples =  [{
    name: "Careless Whisper", 
    artists: [{name: "George Michael"}], 
    album: {
      images: [{url: 'assets/careless_whisper.jpg'}, {url: 'assets/careless_whisper.jpg'}]
    }
  }]

  isLoaded = false;
  indexes = []
  submitted = false;
  isCorrect = false;
  score = 0;
 
  started = false
  played = false
  done = false

  ngOnInit() {
    this.started = true;
  }

  // Question Navigation
  // have an array of 10 bools, and an int p keeping track of page
  // when that page is active the bool_arr[p] = true
  // when nextPage() is called p++ and bool_arr updated

  nextPage() {
    this.router.navigate(["/welcome"]);
  }
  

  /* AUDIO CODE */
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
      // removes tutorial element
      this.started = false;
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
      this.score += 100 * this.prevTime;
      //console.log(submission + " = " + ans.artists[0].name + " - " + ans.name);
      console.log("score: " + this.score);
    } else {
      this.isCorrect = false;
      console.log(submission + " != " + ans.artists[0].name + " - " + ans.name);
      console.log("score: " + this.score);
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
          if (_this.timet < 43 && _this.timerStarted == true) {
            _this.timet += 1;
            if (_this.timet % 2 == 1) {
              _this.circlePulse();
            }
          } else if (_this.timet >= 43 && _this.timerStarted == true) {
            _this.submitted = true;
            _this.isCorrect = false;
            _this.endTimer();
          }
        }, 1000);
      }, 500);
      setTimeout(function() {
        _this.played = true;
      }, 5000);
    }
  }

  endTimer() {
    this.timerStarted = false;
    clearInterval(this.incrementTime);
    if (this.timet <= 3) {
      this.prevTime = 1;
    } else if (this.timet > 3) {
      this.prevTime = 1 - (this.timet - 3) / 20;
    }
    this.timet = 0;
    this.played = false;
    this.started = false;
    this.done = true;
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