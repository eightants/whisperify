import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TitleTagService } from '../services/title-tag.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import { DatastoreService } from '../services/datastore.service';

// function for a random int
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generateid() {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let ret = '';
  for (let i = 0; i < 5; i++) {
    ret += chars[getRandomInt(chars.length)];
  }
  return ret;
}

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ScoreComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private spotify: SpotifyService,
    private data: DatastoreService,
    private titleTagService: TitleTagService
  ) {}

  score = NaN;
  token = '';
  username = '';
  tracks = [];
  trackprev = [];
  trimtracks = [];
  isLoaded = false;
  indexes = [];
  submitted = false;
  isCorrect = false;
  percent = null;
  config = {};
  challengeObj = {};
  hasTracks = false;
  displayname = 'Host';
  challengeCode = '';
  enteredName = '';
  hostName = '';
  leaderboard = [];
  myRank = 0;
  isGenerated = false;
  currentLink = '';
  urlchange;
  sentDB;

  ngOnInit() {
    this.titleTagService.setTitle('Score - Whisperify');
    this.titleTagService.setSocialMediaTags(
      'Score - Whisperify',
      'An interactive way to learn about your favourite songs on Spotify. Quiz yourself on your favourite songs and playlists, make your own quizzes, and share quizzes with friends. '
    );
    this.isGenerated = false;
    this.username = sessionStorage.getItem('username');
    this.displayname = sessionStorage.getItem('displayname');
    this.percent = sessionStorage.getItem('percent') || 50;
    this.sentDB = sessionStorage.getItem('sentDB');
    this.enteredName = sessionStorage.getItem('enteredName') || 'You';
    this.score = Number(sessionStorage.getItem('score')) || -1;
    this.currentLink = sessionStorage.getItem('currentLink') || '';
    this.spotify.cleanChallenges();
    this.urlchange = this.route.params.subscribe((params) => {
      this.challengeCode = params['code'] || ''; // gets code from url
      if (this.challengeCode != '') {
        this.spotify
          .getChallenge(this.challengeCode)
          .then((res) => {
            const tmpboard = res['scoreboard'].slice();
            if (this.sentDB == 'no' && this.score >= 0) {
              // If score from current session not posted to db, use the session stored score for leaderboard
              tmpboard.push({
                name: this.enteredName,
                score: this.score,
                me: true,
              });
              this.leaderboard = tmpboard.sort((a, b) =>
                a.score > b.score ? -1 : 1
              );
              // search sorted leaderboard for the index of user object, which is their rank
              this.myRank = this.leaderboard.findIndex((x) => x.me === true);
            } else {
              // if already posted, use the scoreboard from the db, avoid duplicates
              this.leaderboard = tmpboard.sort((a, b) =>
                a.score > b.score ? -1 : 1
              );
              this.hostName = tmpboard.find((obj) => obj.host === true).name;
            }
            if (this.sentDB == 'no') {
              // POST the challenger score to the db
              const toPostBoard = res['scoreboard'].slice();
              toPostBoard.push({ name: this.enteredName, score: this.score });
              this.spotify.addChallengeScore(this.challengeCode, toPostBoard);
              sessionStorage.setItem('sentDB', 'yes');
            }
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        this.token = sessionStorage.getItem('token');
        if (this.score < 0) {
          this.router.navigate(['/']);
        }
        this.challengeObj = {
          _id: generateid(),
          hostid: this.username,
          time: Date.now(),
          whisperLen: 5,
          timeLimit: 20,
          tracks: [],
          scoreboard: [],
          tracklist: [],
          indexes: [],
        };
        this.data.currentConfig.subscribe((configs) => {
          if (configs == 'default') {
            //this.router.navigate(["/welcome"]);
          } else {
            this.config = configs;
            this.challengeObj['whisperLen'] = this.config['whisperLen'];
            this.challengeObj['timeLimit'] = this.config['timeLimit'];
          }
        });
        this.data.currentSongs.subscribe((songs) => {
          if (songs == 'default') {
            //this.router.navigate(["/welcome"]);
          } else {
            this.challengeObj['tracks'] = songs;
            this.hasTracks = true;
          }
        });
        this.data.currentSongList.subscribe((songList) => {
          if (songList == 'default') {
            //this.router.navigate(["/welcome"]);
          } else {
            this.challengeObj['tracklist'] = songList;
          }
        });
        this.data.currentIndexes.subscribe((indList) => {
          if (indList == 'default') {
            //this.router.navigate(["/welcome"]);
          } else {
            this.challengeObj['indexes'] = indList;
          }
        });
        this.getSongsAndPostToDB();
      }
    });
  }

  getSongsAndPostToDB() {
    // checks that token is present and we haven't already sent this quiz round to DB
    if (this.token != '' && this.token != null && this.sentDB == 'no') {
      sessionStorage.setItem('sentDB', 'yes');
      this.spotify.addScore({
        _id: this.username,
        name: this.displayname,
        score: this.score,
      });
      this.challengeObj['scoreboard'].push({
        name: this.displayname,
        score: this.score,
        host: true,
      });
      // takes the response from sending score to database and calculates percentage of users beaten
      this.spotify.getPercent(this.score + 100).then((resp) => {
        this.percent = Math.floor(100 * resp.body['percent']);
        sessionStorage.setItem('percent', this.percent);
      });
    }
  }

  openShare() {
    this.isGenerated = true;
    if (this.currentLink == '') {
      this.generateLink();
    }
  }

  generateLink(retries = 5) {
    // insert this object to database, regenerating code if doesn't work.
    //console.log(this.challengeObj);
    if (retries > 0) {
      //console.log(retries);
      this.spotify
        .addChallenge(this.challengeObj)
        .then(() => {
          this.currentLink = this.challengeObj['_id'];
          sessionStorage.setItem('currentLink', this.currentLink);
          return;
        })
        .catch(() => {
          this.challengeObj['_id'] = generateid();
          return this.generateLink(--retries);
        });
    } else {
      console.log('failed all retries');
      this.isGenerated = false;
    }
    // after has been inserted, CONFIRM success and load the popup
    // result link should be a different challenge-score page, should work immediately
  }

  unLoad() {
    this.isGenerated = false;
  }

  playAgain() {
    sessionStorage.setItem('score', 'NaN');
    if (this.challengeCode == '' || this.currentLink != '') {
      this.router.navigate(['/welcome']);
    } else {
      this.router.navigate(['/challenge', this.challengeCode]);
    }
  }

  toAnalysis() {
    const token = sessionStorage.getItem('token');
    if (sessionStorage.getItem('answered') == 'yes') {
      this.router.navigate(['/analysis']);
    } else if (token != null && token != '') {
      this.router.navigate(['/survey']);
    } else {
      this.router.navigate(['/analysis']);
    }
  }

  ngOnDestroy() {
    this.urlchange.unsubscribe();
  }
}
