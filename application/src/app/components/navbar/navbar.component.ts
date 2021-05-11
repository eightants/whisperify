import {
  Component,
  HostListener,
  OnInit,
  Injectable,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
@Injectable()
export class NavbarComponent implements OnInit {
  constructor(
    private router: Router,
    private spotify: SpotifyService,
    @Inject(PLATFORM_ID) protected platformId: Object
  ) {}

  showProfile = false;
  displayname = '';
  token = '';
  username = '';
  pfp = 'url(/assets/pfp.jpg)';

  @HostListener('document:click', ['$event']) hideProfile(): void {
    this.showProfile = false;
  }

  ngOnInit(): void {
    this.showProfile = false;
    if (isPlatformBrowser(this.platformId)) {
      this.displayname = sessionStorage.getItem('displayname') || '';
      this.username = sessionStorage.getItem('username') || '';
      this.pfp = sessionStorage.getItem('pfp');
      this.token = sessionStorage.getItem('token');
      if (this.token != '' && (this.displayname == '' || this.pfp == '')) {
        this.spotify.getProfile(this.token).then((res) => {
          this.displayname = res['display_name'];
          if (res['images'].length > 0) {
            this.pfp = res['images'][0]['url'];
          }
        });
      }
    }
  }

  toggleProfile(event): void {
    event.stopPropagation();
    this.showProfile = !this.showProfile;
  }

  toAnalysis(): void {
    const token = sessionStorage.getItem('token');
    if (sessionStorage.getItem('answered') == 'yes') {
      this.router.navigate(['/analysis']);
    } else if (token != null && token != '') {
      this.router.navigate(['/survey']);
    } else {
      this.router.navigate(['/analysis']);
    }
  }

  toMenu(): void {
    const token = sessionStorage.getItem('token');
    if (token != null && token != '') {
      this.router.navigate(['/welcome']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
