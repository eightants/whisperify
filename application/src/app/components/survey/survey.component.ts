import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TitleTagService } from '../services/title-tag.service';
import {SurveyRes} from './surveyres';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'], 
  encapsulation: ViewEncapsulation.None,
})
export class SurveyComponent implements OnInit {

  constructor(private http:HttpClient, private router: Router, private spotify: SpotifyService, private titleTagService: TitleTagService) { }

  submitted = false;
  token = "";
  model = new SurveyRes("","", "", "", "","");
  ngOnInit() {
    this.titleTagService.setTitle('Personality Quiz - Whisperify');
    this.titleTagService.setSocialMediaTags(
      'Personality Quiz - Whisperify',
      "Improve Whisperify by answering a few questions in a personality quiz."
    );
    this.token = sessionStorage.getItem("token");
    this.model["_id"] = sessionStorage.getItem("username");
  }

  validRes() {
    let arr = Object.getOwnPropertyNames(this.model);
    for (let i = 1; i < arr.length; i++) {
      if (this.model[arr[i]] == "") {
        return false;
      }
    }
    return true;
  }

  onSubmit() { 
    this.submitted = true; 
    sessionStorage.setItem("answered", "yes");
    //console.log(this.model);
    this.spotify.addEntry(this.model);
    this.router.navigate(["/analysis"]);
  }
  
  get diagnostic() { return JSON.stringify(this.model); }

}
