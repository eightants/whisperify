import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {DatastoreService} from './components/services/datastore.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], 
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private data: DatastoreService) {}

  title = 'Whisperify';
  
  url = "";
  rawparams = "";
  params = "";
  token = "";

  ngOnInit() {
    // on load, if url contains ? (means that it's authenticated), will call checkUrl()
    this.url = window.location.href;
    if (this.url.includes("?")) {
      this.checkUrl();
    }
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
      // save token to sessionStorage and set the pageNumber to be 0 (start of quiz)
      sessionStorage.setItem("token", this.token);
      sessionStorage.setItem("pageNum", "0");
      // redirects to welcome page if successful
      //console.log("checking")
      this.router.navigate(["./welcome"]);
    }
  }
}
