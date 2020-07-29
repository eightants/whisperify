import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(private router:Router, private spotify: SpotifyService) { }

  showProfile = false;
  username = "";
  pfp = "url(/assets/pfp.jpg)";

  @HostListener('document:click', ['$event']) hideProfile() {
    this.showProfile = false;
  }

  ngOnInit() {
    this.showProfile = false;
    this.username = sessionStorage.getItem("username") || "";
    this.pfp = sessionStorage.getItem("pfp");
    if (this.username =="" || this.pfp == "") {
      this.spotify.getProfile(sessionStorage.getItem('token')).then(res => {
        this.username = res["id"];
        if (res["images"].length > 0) {
          this.pfp = res["images"][0]["url"];
        }
      });
    }
  }

  toggleProfile(event) {
    event.stopPropagation();
    this.showProfile = !this.showProfile;
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

  toMenu() {
    var token = sessionStorage.getItem("token");
    if (token != null && token != "") {
      this.router.navigate(["/welcome"]);
    } else {
      this.router.navigate(["/"]);
    }
  }

}
