import { Component, OnInit } from '@angular/core';
import { formatNumberCustom } from 'src/app/globals';
import { SpotifyService } from '../services/spotify.service';

type LeaderboardUser = {
  attempts: number;
  score: number;
  total: number;
  xp: number;
};

const LVL_MULT = 0.5;

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  sortByMap = {
    'High Score': 'top',
    'Total Score': 'total',
    Experience: 'level',
  };
  topScores;
  sortBy: Array<string>;
  chosenSortBy: string;
  isLoading: boolean;
  currUser: string;

  constructor(private spotify: SpotifyService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.currUser = sessionStorage.getItem('username');
    this.sortBy = ['High Score', 'Total Score', 'Experience'];
    this.chosenSortBy = 'High Score';
    this.getLeaderboardHook();
  }

  getLeaderboardHook(): void {
    this.isLoading = true;
    this.spotify
      .getLeaderboard(this.sortByMap[this.chosenSortBy])
      .then((res) => {
        this.topScores = res;
        this.isLoading = false;
      });
  }

  chooseSortBy(val: string): void {
    this.chosenSortBy = val;
    this.getLeaderboardHook();
  }

  randomNumberFromString(s: string): string {
    return (s.length * Date.now()).toString().slice(0, 4);
  }

  calculateLevelFromXP(xp: number): number {
    return Math.floor(LVL_MULT * Math.sqrt(xp));
  }

  displayStats(user: LeaderboardUser): string {
    return this.chosenSortBy === 'High Score'
      ? user.score.toString()
      : this.chosenSortBy === 'Total Score'
      ? formatNumberCustom(user.total)
      : this.calculateLevelFromXP(user.xp).toString();
  }

  displayLabel(): string {
    return this.chosenSortBy === 'Experience' ? 'LVL' : 'SCORE';
  }
}
