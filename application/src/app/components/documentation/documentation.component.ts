import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DOCS_SECTIONS } from "../../globals"

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss']
})
export class DocumentationComponent implements OnInit {

  urlchange;
  path: string;
  docsNav = DOCS_SECTIONS;
  selected;
  sidebar=false;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.urlchange = this.route.params.subscribe(params => {
      if (params['section']) {
        this.path = 'assets/docs/' +  params['section'] + '.md';
      } else {
        this.path = 'assets/docs/' +  params['title'] + '.md';
      }
      
    });
  }

}
