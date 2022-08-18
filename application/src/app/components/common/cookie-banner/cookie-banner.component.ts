import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss'],
})
export class CookieBannerComponent implements OnInit {
  seenCookieBanner = 'yes';

  ngOnInit(): void {
    if (sessionStorage) {
      this.seenCookieBanner = sessionStorage.getItem('seenCookieBanner');
    } else {
      this.seenCookieBanner = 'no';
    }
  }

  seenCookie(): void {
    if (sessionStorage) {
      sessionStorage.setItem('seenCookieBanner', 'yes');
    }
    this.seenCookieBanner = 'yes';
  }
}
