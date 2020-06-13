import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import { DatastoreService } from '../services/datastore.service';

// function for a random int
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'], 
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeComponent implements OnInit {

  constructor(private router: Router, private spotify: SpotifyService, private data: DatastoreService) { }
  token = "";
  isLoaded = false;
  playlists=[];
  titleText = "Choose a quiz mode. ";
  options = false;
  // these variables are the configs of the quiz
  whisperLen = [5, 10];
  timeLimit = [20, 40];
  timePeriod = ["4 weeks", "6 months", "Lifetime"];
  chosenPeriod = "6 months";
  modeChoice = "top";
  config = {};
  artists = new Map();
  artistList = [];
  excludeModule = false;
  searchStr = "";
  searchVal:string;
  searchList = [];
  off = 0;
  pid = 0
  psize = 0;
  prevExclude = [];
  totsongs = 100;
  timePeriodMap = {
    "4 weeks": "short_term", 
    "6 months": "medium_term", 
    "Lifetime": "long_term"
  };
 

  ngOnInit() {
    this.token = sessionStorage.getItem("token");
    sessionStorage.setItem("challenge", "");
    sessionStorage.setItem("currentLink", "");
    sessionStorage.setItem("choice", "top");
    this.modeChoice = "top";
    this.totsongs = 100;
    this.excludeModule = false;
    this.config = {
      whisperLen: 5, 
      timeLimit: 20, 
      excludeArtists: [], 
      multChoice: false
    }

    //this.spotify.cleanChallenges(Date.now() - 180000000);
  }

  chooseTop() {
    this.options = true;
  }

  choosePeriod(val) {
    this.chosenPeriod = val;
    this.artistList = [];
    this.config["excludeArtists"] = [];
  }

  choosePlaylist() {
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
    this.pid = p.id;
    sessionStorage.setItem("pid", p.id);
    this.psize = p.tracks.total;
    sessionStorage.setItem("psize", p.tracks.total);
    sessionStorage.setItem("choice", "playlist");
    if (p.tracks.total > 100) {
      this.off = getRandomInt(p.tracks.total - 100);
      sessionStorage.setItem("off", String(this.off));
    } else {
      sessionStorage.setItem("off", String(this.off));
    }
    this.modeChoice = "playlist";
    this.unLoad();
    this.options = true;
  }

  toggleOptions() {
    this.options = false;
    this.artistList = [];
    this.config["excludeArtists"] = [];
  }

  startQuiz() {
    if (this.modeChoice == "top") {
      sessionStorage.setItem("timePeriod", this.chosenPeriod);
    }
    console.log(this.totsongs);
    if (this.totsongs < 30) {
      //console.log("not enough")
      this.router.navigate(["/no-info"]);
    } else {
      this.data.changeConfigs(this.config);
      this.router.navigate(["/quiz"]);
    }
  }

  unLoad() {
    this.isLoaded = false;
    this.excludeModule = false;
  }

  unLoadExclude() {
    this.excludeModule = false;
    this.searchList = this.artistList;
    this.config["excludeArtists"] = this.prevExclude.slice();
  }

  toExclude() {
    this.loadArtists();
    this.excludeModule=true;
  }

  loadArtists() {
    if (this.token == "" || this.token == null) {
      this.router.navigate(["/"]);
    }
    // ES6 passes by reference in arrays, so need slice
    this.prevExclude = this.config["excludeArtists"].slice();
    // get playlist or top tracks depending on the selection
    if (this.artistList.length <= 0) {
      if (sessionStorage.getItem("choice") == "top") {
      // get request
        this.spotify.getTracks(this.token, "0", this.timePeriodMap[this.chosenPeriod]).then(
          res => {
            this.spotify.getTracks(this.token, "49", this.timePeriodMap[this.chosenPeriod]).then(
              res2 => {
            let trackprev = res['items'].concat(res2["items"]);
            this.totsongs = trackprev.length;
            // since we're just trying to get the artists in the top songs, we just loop and count the artists
            for (let i = 0; i < trackprev.length; i++) {
              if (this.artists.has(trackprev[i].artists[0].name)) {
                this.artists.get(trackprev[i].artists[0].name).val++;
              } else {
                this.artists.set(trackprev[i].artists[0].name, {"val": 1, "id": trackprev[i].artists[0].id});
              }
            }
            this.artistList = Array.from(this.artists.keys()).sort();
            //console.log(this.artistList);
            this.searchArtists();
          })
        }
        ).catch((e) => {
          console.log(e);
          this.router.navigate(["/"]);
        });
      } else {
        let off = this.off;
        this.spotify.getPlaylistTracks(this.pid, this.token, off.toString()).then(
          res => {
            let trackprev = res["items"];
            this.totsongs = trackprev.length;
            //console.log(this.totsongs);
            //console.log(trackprev);
            for (let i = 0; i < trackprev.length; i++) {
              //console.log(trackprev[i].track.artists[0].name)
              if (this.artists.has(trackprev[i].track.artists[0].name)) {
                this.artists.get(trackprev[i].track.artists[0].name).val++;
              } else {
                this.artists.set(trackprev[i].track.artists[0].name, {"val": 1, "id": trackprev[i].track.artists[0].id});
              }
            }
            this.artistList = Array.from(this.artists.keys()).sort();
            //console.log(this.artists);
            //console.log(this.tracks.length)
            this.searchArtists();
          }
        ).catch((e) => {
          console.log(e);
          this.router.navigate(["/"]);
        });
      }
    } else {
      this.searchArtists();
    }
  }

  searchArtists() {
    // resets the array of tracks every keystroke
    if (this.searchStr == "" || this.searchStr == null) {
      this.searchList = this.artistList;
    } else {
      this.searchList = this.artistList;
      this.searchVal = this.searchStr;
      let keywords = this.searchStr.toLowerCase().split(' ');
      for (let i = 0; i < keywords.length; i++) {
        let tempArr = []
        for (let j = 0; j < this.searchList.length; j++) {
          // search song title for match with search term searchStr, also convert arr of artists into a string see if match too
          if (this.searchList[j].toLowerCase().includes(keywords[i])) {
            // adds the formatted song - artist to be iterated through and displayed in dropdown in tempArr
            tempArr.push(this.searchList[j]);
            //console.log(keywords[i], this.searchRes[j].name)
          }
        }
        this.searchList = tempArr;
      }
    }
  }
  
  addArtist(name) {
    this.config["excludeArtists"].push(name);
    this.totsongs -= this.artists.get(name).val;
    this.searchVal = "";
    this.searchStr = "";
    //console.log(this.totsongs);
  }

  removeArtist(name) {
    let index = this.config["excludeArtists"].indexOf(name);
    if (index > -1) {
      this.config["excludeArtists"].splice(index, 1);
      this.totsongs += this.artists.get(name).val;
    }
  }
}
