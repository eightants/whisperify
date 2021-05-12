import { TitleTagService } from '../services/title-tag.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent implements OnInit {
  constructor(
    private router: Router,
    private titleTagService: TitleTagService
  ) {}

  ind = 0;
  /* example track item object simulated */

  examples = [
    {
      name: 'Careless Whisper',
      artists: [{ name: 'George Michael' }],
      album: {
        images: [
          { url: 'assets/careless_whisper.jpg' },
          { url: 'assets/careless_whisper.jpg' },
        ],
      },
    },
  ];

  isLoaded = false;
  indexes = [];
  submitted = false;
  isCorrect = false;
  score = 0;

  maxVolume = 0.5;
  showVolume = false;

  started = false;
  played = false;
  done = false;

  ngOnInit() {
    this.titleTagService.setTitle('Tutorial - Whisperify');
    this.titleTagService.setSocialMediaTags(
      'Tutorial - Whisperify',
      'A quick introduction to Whisperify quizzes with the best song ever. '
    );
    this.started = true;
  }

  nextPage() {
    this.router.navigate(['/welcome']);
  }

  handleVolume(value) {
    this.maxVolume = value;
  }

  /* AUDIO CODE */
  // gets the audio DOM element
  @ViewChild('musicAudio', { static: false }) source;
  @ViewChild('blueWave', { static: false }) blueWave;

  stopAudio() {
    this.source.nativeElement.load();
    this.blueWave.nativeElement.classList.remove(
      'animate-wave',
      'blue-finished'
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
      this.blueWave.nativeElement.classList.add(
        'animate-wave',
        'blue-finished'
      );
      // removes tutorial element
      this.started = false;
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
    const fadePoint = /* sound end duration */ 4;
    const fadeAudio = setInterval(function () {
      // Only fade if past the fade out point or not at zero already
      if (sound.currentTime >= fadePoint && sound.volume > 0.0) {
        try {
          sound.volume -= currMaxVolume / 10;
        } catch (TypeError) {
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
    if (submission == ans.artists[0].name + ' - ' + ans.name) {
      this.isCorrect = true;
      this.score += 100 * this.prevTime;
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
      // increments timer depending on values, and automatic expiry
      setTimeout(() => {
        this.timerStarted = true;
        this.incrementTime = setInterval(() => {
          if (this.timet < 43 && this.timerStarted == true) {
            this.timet += 1;
            if (this.timet % 2 == 1) {
              this.circlePulse();
            }
          } else if (this.timet >= 43 && this.timerStarted == true) {
            this.submitted = true;
            this.isCorrect = false;
            this.endTimer();
          }
        }, 1000);
      }, 500);
      setTimeout(function () {
        this.played = true;
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
    if (this.timet < num) {
      return true;
    } else {
      return false;
    }
  }
}
