import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
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
