import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, ParamMap  } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import { DatastoreService } from '../services/datastore.service';

// function for a random int
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generateid() {
  var chars = "abcdefghijklmnopqrstuvwxyz1234567890"
  var ret = ""
  for (var i = 0; i < 5; i++) {
    ret += chars[getRandomInt(chars.length)];
  }
  return (ret);
}

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'], 
  encapsulation: ViewEncapsulation.None, 
})
export class ScoreComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private spotify: SpotifyService, private data: DatastoreService) { }

  score = NaN;
  token = "";
  tracks = [];
  trackprev = [];
  trimtracks = [];
  isLoaded = false;
  indexes = []
  submitted = false;
  isCorrect = false;
  percent = null;
  config = {}
  challengeObj = {}
  hasTracks = false;
  displayname = "Host";
  challengeCode = "";
  enteredName = "";
  hostName = "";
  leaderboard = [];
  myRank = 0;
  isGenerated = false;
  currentLink = "";
  urlchange;
  sentDB;

  ngOnInit() {
    this.isGenerated = false;
    this.percent = sessionStorage.getItem("percent") || 50;
    this.sentDB = sessionStorage.getItem("sentDB");
    this.enteredName = sessionStorage.getItem("enteredName") || "You";
    this.score = Number(sessionStorage.getItem("score")) || -1;
    this.currentLink = sessionStorage.getItem("currentLink") || "";
    this.spotify.cleanChallenges();
    this.urlchange = this.route.params.subscribe(params => {
      this.challengeCode = params["code"] || ""; // gets code from url
      if (this.challengeCode != "") {
        this.spotify.getChallenge(this.challengeCode).then(
          res => {
            let tmpboard = res["scoreboard"].slice();
            if (this.sentDB == "no" && this.score >= 0) {
              // If score from current session not posted to db, use the session stored score for leaderboard
              tmpboard.push({name: this.enteredName, score: this.score, me: true});
              this.leaderboard = tmpboard.sort((a, b) => (a.score > b.score) ? -1 : 1);
              // search sorted leaderboard for the index of user object, which is their rank
              this.myRank = this.leaderboard.findIndex(x => x.me === true);
            } else {
              // if already posted, use the scoreboard from the db, avoid duplicates
              this.leaderboard = tmpboard.sort((a, b) => (a.score > b.score) ? -1 : 1);
              this.hostName = tmpboard.find(obj => obj.host === true).name;
            }
            if (this.sentDB == "no") {
              // POST the challenger score to the db
              let toPostBoard = res["scoreboard"].slice();
              toPostBoard.push({name: this.enteredName, score: this.score});
              this.spotify.addChallengeScore(this.challengeCode, toPostBoard);
              sessionStorage.setItem("sentDB", "yes")
            }
          }).catch((e) => {
            console.log(e);
            this.router.navigate(["/"]);
          });
      } else {
        this.token = sessionStorage.getItem("token");
        if (this.score < 0) {
          this.router.navigate(["/"]);
        }
        this.challengeObj = {
          "_id": generateid(),
          "time": Date.now(),
          "whisperLen": 5, 
          "timeLimit": 20, 
          "tracks": [], 
          "scoreboard": [], 
          "tracklist": [], 
          "indexes": []
        }
        this.data.currentConfig.subscribe(configs => {
          if (configs == "default") {
            //this.router.navigate(["/welcome"]);
          } else {
            this.config = configs;
            this.challengeObj["whisperLen"] = this.config["whisperLen"];
            this.challengeObj["timeLimit"] = this.config["timeLimit"];
          }
        });
        this.data.currentSongs.subscribe(songs => {
          if (songs == "default") {
            //this.router.navigate(["/welcome"]);
          } else {
            this.challengeObj["tracks"] = songs;
            this.hasTracks = true;
          }
        });
        this.data.currentSongList.subscribe(songList => {
          if (songList == "default") {
            //this.router.navigate(["/welcome"]);
          } else {
            this.challengeObj["tracklist"] = songList;
          }
        });
        this.data.currentIndexes.subscribe(indList => {
          if (indList == "default") {
            //this.router.navigate(["/welcome"]);
          } else {
            this.challengeObj["indexes"] = indList;
          }
        });
        this.getSongsAndPostToDB();
      }
    });
  }

  getSongsAndPostToDB() {
    // checks that token is present and we haven't already sent this quiz round to DB
    if (this.token != "" && this.token != null && this.sentDB == "no") {
    // get request
      sessionStorage.setItem("sentDB", "yes");
      this.spotify.getTracks(this.token, "0", "medium_term").then(
        res => {
          this.spotify.getTracks(this.token, "49", "medium_term").then(
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
                    name: this.trackprev[i].artists[0].name
                  }], 
                  external_urls: this.trackprev[i].external_urls,
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
              /*this.spotify.addEntry({
                [useres["id"]]: {
                  name: useres["display_name"], 
                  email: useres["email"], 
                  tracks: this.trimtracks, 
                  country: useres["country"], 
                  time: Date.now(), 
                  score: this.score
                }
              });*/
              this.displayname = useres["display_name"];
              this.spotify.addEntry({
                  _id: useres["id"], 
                  name: useres["display_name"], 
                  /*email: useres["email"], */
                  tracks: this.trimtracks.slice(0, 50), 
                  country: useres["country"], 
                  score: this.score
              });
              //console.log("sent")
              this.challengeObj["scoreboard"].push({name: this.displayname, score: this.score, host: true});
              // takes the response from sending score to database and calculates percentage of users beaten
              this.spotify.addScore(this.score).then(
                resp => {
                  //console.log(resp)
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

  openShare() {
    this.isGenerated = true;
    if (this.currentLink == "") {
      this.generateLink();
    }
  }

  generateLink(retries = 5) {
    // insert this object to database, regenerating code if doesn't work.
    //console.log(this.challengeObj);
    if (retries > 0) {
      //console.log(retries);
      this.spotify.addChallenge(this.challengeObj).then(
        resp => {
          //console.log(this.challengeObj["tracks"])
          //console.log(resp);
          this.currentLink = this.challengeObj["_id"];
          sessionStorage.setItem("currentLink", this.currentLink);
          return;
        }
      ).catch((e) => {
        //console.log(e)
        this.challengeObj["_id"] = generateid();
        return this.generateLink(--retries);
      });
    } else {
      console.log("failed all retries");
      this.isGenerated = false;
    }
    // after has been inserted, CONFIRM success and load the popup
    // result link should be a different challenge-score page, should work immediately
    
  }

  unLoad() {
    this.isGenerated = false;
  }

  copyLink(val) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    selBox.setAttribute('readonly', 'true');
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    selBox.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(selBox);
    // another way to write to clipboard  but idk if the above one already works
    navigator.clipboard.writeText(val);
  }

  playAgain() {
    sessionStorage.setItem("score", "NaN");
    if (this.challengeCode == "" || this.currentLink != "") {
      this.router.navigate(["/welcome"]);
    } else {
      this.router.navigate(["/challenge", this.challengeCode]);
    }
  }

  ngOnDestroy() {
    this.urlchange.unsubscribe();
  }
}
