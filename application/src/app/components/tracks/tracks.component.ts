import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss']
})
export class TracksComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router, private spotify: SpotifyService) { }


  token = "";
  tracks = [];
  trackprev = [];
  isLoaded = false;
  indexes = []

  ngOnInit() {
    this.token = sessionStorage.getItem("token");
    console.log(this.token);
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
          console.log(this.tracks.length)
          this.isLoaded = true;
        })
        }
      ).catch((e) => {
        console.log(e);
      this.router.navigate(["/"]);
      });
  }

}
