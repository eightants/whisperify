import { TitleTagService } from '../services/title-tag.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-info',
  templateUrl: './no-info.component.html',
  styleUrls: ['./no-info.component.scss'],
})
export class NoInfoComponent implements OnInit {
  constructor(private titleTagService: TitleTagService) {}

  ngOnInit(): void {
    this.titleTagService.setTitle('Not enough information - Whisperify');
    this.titleTagService.setSocialMediaTags(
      'Not enough information - Whisperify',
      'This content is not available on the site. '
    );
  }
}
