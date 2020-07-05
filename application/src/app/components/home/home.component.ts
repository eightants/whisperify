import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    // sets some session variables to null, which logs the user out
    sessionStorage.setItem("currentLink", "");
    sessionStorage.setItem("token", "");
    sessionStorage.setItem("username", "");
    sessionStorage.setItem("displayName", "");
  }


}
