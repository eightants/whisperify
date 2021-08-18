import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LVL_MULT } from 'src/app/globals';
import { SpotifyService } from '../services/spotify.service';
import { TitleTagService } from '../services/title-tag.service';

const NO_BADGE = '/assets/badges/badgenone.svg';
const BRONZE = '/assets/badges/badgebronze.svg';
const SILVER = '/assets/badges/badgesilver.svg';
const GOLD = '/assets/badges/badgegold.svg';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  SCORE_KEY = {
    0: NO_BADGE,
    700: BRONZE,
    1300: SILVER,
    2000: GOLD,
  };
  AVERAGE_KEY = {
    0: NO_BADGE,
    600: BRONZE,
    1100: SILVER,
    1800: GOLD,
  };
  GAMES_KEY = {
    0: NO_BADGE,
    20: BRONZE,
    50: SILVER,
    100: GOLD,
  };
  CHALLENGES_KEY = {
    0: NO_BADGE,
    10: BRONZE,
    30: SILVER,
    50: GOLD,
  };
  PLAYERS_KEY = {
    0: NO_BADGE,
    100: BRONZE,
    1000: SILVER,
    10000: GOLD,
  };

  currTab = 'profile';
  username: string;
  displayname: string;
  challenges = [];
  user: any;
  isLoading = true;
  totalPlayers = 0;
  selectedChallenge: string;
  displayProfile = false;

  showModal = false;
  copiedBanner = false;
  deletedBanner = false;

  constructor(
    private spotify: SpotifyService,
    private titleTagService: TitleTagService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const usernameParam = params['username'];
      if (usernameParam) {
        this.username = usernameParam;

        this.titleTagService.setTitle(`${this.username} - Whisperify`);
        this.titleTagService.setSocialMediaTags(
          `${this.username} - Whisperify`,
          `User quiz statistics and created challenges for ${this.username} on Whisperify.`
        );
      } else {
        this.username = sessionStorage.getItem('username') || '';
        this.displayname = sessionStorage.getItem('displayname') || '';
        this.displayProfile = true;

        this.titleTagService.setTitle('Profile - Whisperify');
        this.titleTagService.setSocialMediaTags(
          'Profile - Whisperify',
          'User quiz statistics and created challenges. '
        );
      }
    });
    if (this.username) {
      this.getUserChallenges();
      this.spotify.getUserProfile(this.username).then((res: any) => {
        this.isLoading = false;
        this.user = res;
        this.displayname = res.name;
      });
    }
  }

  getUserChallenges() {
    this.spotify.getChallengesByUser(this.username).then((res: any[]) => {
      this.isLoading = false;
      this.challenges = res;
      let totalCount = 0;
      for (const challenge of res) {
        totalCount += challenge.scoreboard.length;
      }
      this.totalPlayers = totalCount;
      console.log(res);
    });
  }

  processDate(time: number): string {
    return new Date(time).toLocaleDateString('en-GB');
  }

  selectTab(tab: string): void {
    this.currTab = tab;
  }

  getAchievedBadge(currentCount: number, map: any): number {
    let achieved = 0;
    for (const targetStr of Object.keys(map)) {
      const target = Number(targetStr);
      if (currentCount >= target) {
        achieved = target;
      }
    }
    return achieved;
  }

  getNextBadge(currentCount: number, map: any): number {
    let target = 0;
    for (const targetStr of Object.keys(map)) {
      target = Number(targetStr);
      if (currentCount < target) {
        return target;
      }
    }
    return target;
  }

  resetBanner() {
    this.copiedBanner = false;
    this.deletedBanner = false;
  }

  confirmDelete(code: string) {
    this.selectedChallenge = code;
    this.showModal = true;
  }

  deleteChallenge(code: string) {
    this.spotify.deleteChallenge(code).then(() => {
      this.getUserChallenges();
      this.showModal = false;
      this.deletedBanner = true;
      setTimeout(() => this.resetBanner(), 3000);
    });
  }

  copyLink(val: string) {
    navigator.clipboard.writeText(val);
    this.copiedBanner = true;
    setTimeout(() => this.resetBanner(), 3000);
  }

  calculateLevelFromXP(xp: number): number {
    return Math.floor(LVL_MULT * Math.sqrt(xp));
  }

  roundToInt = (n: number) => Math.floor(n);
}
