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
  username="";
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
    this.username = sessionStorage.getItem("username");
    this.displayname = sessionStorage.getItem("displayname");
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
      sessionStorage.setItem("sentDB", "yes");
      this.spotify.addScore({
                  _id: this.username,
                  score: this.score
              });
      this.challengeObj["scoreboard"].push({name: this.displayname, score: this.score, host: true});
              // takes the response from sending score to database and calculates percentage of users beaten
              this.spotify.getPercent(this.score).then(
                resp => {
                  //console.log(resp)
                  this.percent = Math.floor(100 * resp.body["percent"]);
                  sessionStorage.setItem("percent", this.percent);
                  //console.log('percent', this.percent);
                }
              )
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

  toAnalysis() {
    var token = sessionStorage.getItem("token");
    if (sessionStorage.getItem("answered") == "yes") {
      this.router.navigate(["/analysis"]);
    } else if (token != null && token != "") {
      this.router.navigate(["/survey"]);
    } else {
      this.router.navigate(["/analysis"]);
    }
  }

  ngOnDestroy() {
    this.urlchange.unsubscribe();
  }
}
