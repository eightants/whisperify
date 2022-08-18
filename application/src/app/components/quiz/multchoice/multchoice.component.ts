import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';

// function for a random int
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

@Component({
  selector: 'app-multchoice',
  templateUrl: './multchoice.component.html',
  styleUrls: ['./multchoice.component.scss'],
  providers: [SpotifyService],
})
export class MultchoiceComponent implements OnInit {
  @Output() clickSubmit = new EventEmitter<string>();
  @Input() tracks: any;
  @Input() toChoose: any;
  @Input() altind: number;
  @Input() chosen: number;
  @Input() played: boolean;
  trks = [];
  choices = [];

  constructor(private _spotifyService: SpotifyService) {}

  ngOnInit() {
    let listchoices = [this.chosen];
    this.trks = this.tracks;
    if (this.toChoose.length > 0) {
      listchoices = [this.altind];
      this.trks = this.toChoose;
    }
    while (listchoices.length < 4) {
      const temp = getRandomInt(this.trks.length);
      let unique = true;
      for (let i = 0; i < listchoices.length; i++) {
        if (listchoices[i] == temp) {
          unique = false;
          break;
        }
      }
      if (unique == true) {
        listchoices.push(temp);
      }
    }
    this.choices = listchoices.sort();
  }

  submitVal(artist, name) {
    const searchVal = artist + ' - ' + name;
    if (this.played == true) {
      this.clickSubmit.next(searchVal); // passes searchVal as parameter
    }
  }
}
