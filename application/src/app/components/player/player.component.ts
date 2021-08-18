import { Component, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit {
  @Input() config: any;
  @Input() maxVolume: any;
  @Input() startTimer: any;
  @Input() tracks: any;
  @Input() ind: any;

  constructor() {}

  ngOnInit() {}

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
}
