import {
  Component,
  OnInit,
  Injectable,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { TitleTagService } from '../services/title-tag.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
@Injectable()
export class HomeComponent implements OnInit {
  constructor(
    private titleTagService: TitleTagService,
    @Inject(PLATFORM_ID) protected platformId: Object
  ) {}

  ngOnInit(): void {
    this.titleTagService.setTitle(
      'Whisperify - Spotify Quiz and Music Analysis'
    );
    this.titleTagService.setSocialMediaTags(
      'Whisperify - Spotify Quiz and Music Analysis',
      'An interactive way to learn about your favourite songs on Spotify. View stats, quiz yourself on your favourite playlists, and share quizzes with friends. '
    );
    if (isPlatformBrowser(this.platformId)) {
      // sets some session variables to null, which logs the user out
      sessionStorage.setItem('currentLink', '');
      sessionStorage.setItem('token', '');
      sessionStorage.setItem('username', '');
      sessionStorage.setItem('displayname', '');
    }
  }
}
