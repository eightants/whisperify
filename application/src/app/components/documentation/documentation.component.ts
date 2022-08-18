import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TitleTagService } from '../services/title-tag.service';
import { ActivatedRoute } from '@angular/router';
import { DOCS_SECTIONS } from '../../globals';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DocumentationComponent implements OnInit {
  urlchange;
  path: string;
  docsNav = DOCS_SECTIONS;
  selected;
  sidebar = false;

  constructor(
    private route: ActivatedRoute,
    private titleTagService: TitleTagService
  ) {}

  ngOnInit() {
    this.titleTagService.setTitle('Documentation - Whisperify');
    this.titleTagService.setSocialMediaTags(
      'Documentation - Whisperify',
      'API Reference for Whisperify endpoints and instructions to get set up for developers. Whisperify is an open-source project. '
    );
    this.urlchange = this.route.params.subscribe((params) => {
      if (params['section']) {
        this.path = 'assets/docs/' + params['section'] + '.md';
      } else {
        this.path = 'assets/docs/' + params['title'] + '.md';
      }
    });
  }
}
