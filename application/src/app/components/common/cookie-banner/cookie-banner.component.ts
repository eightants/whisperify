import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss']
})
export class CookieBannerComponent implements OnInit {

  constructor() { }

  seenCookieBanner = "yes"

  ngOnInit() {
    this.seenCookieBanner = sessionStorage.getItem("seenCookieBanner") || "no"
  }

  seenCookie() {
    sessionStorage.setItem("seenCookieBanner", "yes")
    this.seenCookieBanner = "yes"
  }

}
