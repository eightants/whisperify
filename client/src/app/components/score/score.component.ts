import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'], 
  encapsulation: ViewEncapsulation.None, 
})
export class ScoreComponent implements OnInit {

  constructor(private router: Router) { }

  score = "NaN";

  ngOnInit() {
    this.score = sessionStorage.getItem("score");
  }


  playAgain() {
    sessionStorage.setItem("score", "NaN");
    this.router.navigate(["/welcome"]);
  }
}
