import { Component, OnInit } from '@angular/core';
import { TitleTagService } from '../services/title-tag.service';
import { MAINURL } from "../../globals";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private titleTagService: TitleTagService) { }

  ngOnInit() {
    this.titleTagService.setTitle('Whisperify - Spotify Quiz and Music Analysis');
    this.titleTagService.setSocialMediaTags(
      'Whisperify - Spotify Quiz and Music Analysis',
      "An interactive way to learn about your favourite songs on Spotify. View stats, quiz yourself on your favourite playlists, and share quizzes with friends. "
    );
    // sets some session variables to null, which logs the user out
    sessionStorage.setItem("currentLink", "");
    sessionStorage.setItem("token", "");
    sessionStorage.setItem("username", "");
    sessionStorage.setItem("displayName", "");
  }

  onLogin() {
    document.location.href = MAINURL + "login";
  }


}
