import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'], 
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeComponent implements OnInit {

  constructor(private router: Router, private spotify: SpotifyService) { }
  token = "";
  isLoaded = false;
  playlists=[];
  
 

  ngOnInit() {
    sessionStorage.setItem("choice", "top");
  }

  choosePlaylist() {
    this.token = sessionStorage.getItem("token");
    if (this.token == "" || this.token == null) {
      this.router.navigate(["/welcome"]);
    }
    // get playlists
      this.spotify.getPlaylists(this.token, "0").then(
        res => {
          //console.log(res);
          for (let i = 0; i < res["items"].length; i++) {
            if (res["items"][i].tracks.total >= 30) {
              this.playlists.push(res["items"][i]);
            }
          }
          this.isLoaded = true;
        }
      ).catch((e) => {
        console.log(e);
      this.router.navigate(["/"]);
      });
  }
  
  selectPlaylist(p) {
    //console.log(p.id);
    sessionStorage.setItem("pid", p.id);
    sessionStorage.setItem("psize", p.tracks.total);
    sessionStorage.setItem("choice", "playlist");
    this.router.navigate(["/quiz"]);
  }


  unLoad() {
    this.isLoaded = false;
  }
}
