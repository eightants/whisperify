import { Component, OnInit, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import {DatastoreService} from './components/services/datastore.service';
import {isPlatformBrowser} from '@angular/common';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], 
})
@Injectable()
export class AppComponent implements OnInit {
  constructor(private router: Router, private data: DatastoreService, @Inject(PLATFORM_ID) protected platformId: Object) {}

  title = 'Whisperify';
  
  url = "";
  rawparams = "";
  params = "";
  token = "";
  showWaves = true;

  ngOnInit() {
    // on load, if url contains ? (means that it's authenticated), will call checkUrl()
    if (isPlatformBrowser(this.platformId)) {
      this.url = window.location.href;
      if (this.url.includes("?")) {
        this.checkUrl();
      }
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'UA-132344171-3', {
          'page_title': "Whisperify",
          'page_path': event.urlAfterRedirects
        });
        if (event.url == "/about" || event.url == "/documentation") {
          this.showWaves = false;
        } else {
          this.showWaves = true;
        }
      }
    });
  }

  checkUrl() {
    // when Output detected, reads the url and checks if authorized, if yes, then go to welcome page, and save token
    this.rawparams = this.url.split('?')[1];
    this.params = this.rawparams.split('#')[0];
    //console.log(this.params);
    if (this.params == "authorized=true") {
      // token will be found after the # sign, save it
      this.token = this.url.split('#')[1];
      //console.log(this.token);
      //this.data.changeToken(this.token);
      // save token to sessionStorage
      sessionStorage.setItem("token", this.token);
      // redirects to welcome page if successful
      //console.log("checking")
      this.router.navigate(["./welcome"]);
    }
  }
}
