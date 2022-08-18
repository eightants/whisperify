import { Component, OnInit } from '@angular/core';
import { TitleTagService } from '../services/title-tag.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  constructor(private titleTagService: TitleTagService) {}

  ngOnInit() {
    this.titleTagService.setTitle('About Whisperify');
    this.titleTagService.setSocialMediaTags(
      'About Whisperify',
      "An interactive way to learn about your favourite songs on Spotify. Whisperify chooses 10 songs from your top tracks or a playlist on Spotify, and plays you 5-second snippets, or 'whispers', of each song. You get time to guess the song and scored on your speed and accuracy. You can create and share quizzes with friends. "
    );
  }
}
