import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'], 
  encapsulation: ViewEncapsulation.None, 
})
export class ScoreComponent implements OnInit {

  constructor(private router: Router, private spotify: SpotifyService) { }

  score = "NaN";
  token = "";
  tracks = [];
  trackprev = [];
  trimtracks = [];
  isLoaded = false;
  indexes = []
  submitted = false;
  isCorrect = false;
  percent = null;
  sentDB;

  ngOnInit() {
    this.percent = sessionStorage.getItem("percent") || 50;
    this.sentDB = sessionStorage.getItem("sentDB");
    this.score = sessionStorage.getItem("score");
    this.token = sessionStorage.getItem("token");
    //console.log(this.token);
    // checks that token is present and we haven't already sent this quiz round to DB
    if (this.token != "" && this.token != null && this.sentDB == "no") {
    // get request
      sessionStorage.setItem("sentDB", "yes");
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
                // creates a summarized json object to be sent to database
                this.trimtracks.push({
                  album: {
                    images: this.trackprev[i].album.images
                  }, 
                  artists: [{
                    name: this.trackprev[i].artists[0].name, 
                    id: this.trackprev[i].artists[0].id
                  }], 
                  external_urls: this.trackprev[i].external_urls, 
                  id: this.trackprev[i].id, 
                  name: this.trackprev[i].name, 
                  preview_url: this.trackprev[i].preview_url, 
                })
              }
            }
          }
          //console.log(this.tracks.length)
          this.spotify.getProfile(this.token).then(
            useres => {
              //console.log(useres);
              this.spotify.addEntry({
                [useres["id"]]: {
                  name: useres["display_name"], 
                  email: useres["email"], 
                  tracks: this.trimtracks, 
                  country: useres["country"], 
                  time: Date.now(), 
                  score: this.score
                }
              });
              // takes the response from sending score to database and calculates percentage of users beaten
              this.spotify.addScore(this.score).then(
                resp => {
                  this.percent = Math.floor(100 * resp.body["percent"]);
                  sessionStorage.setItem("percent", this.percent);
                  //console.log('percent', this.percent);
                }
              )
            }
          );
          })
        })
      }
  }


  playAgain() {
    sessionStorage.setItem("score", "NaN");
    this.router.navigate(["/welcome"]);
  }
}
