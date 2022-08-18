import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-generate-quiz-popup',
  templateUrl: './generate-quiz-popup.component.html',
  styleUrls: ['./generate-quiz-popup.component.scss'],
})
export class GenerateQuizPopupComponent implements OnInit {
  @Output() unLoad = new EventEmitter<string>();
  @Input() currentLink: string;
  @Input() showPopup: boolean;

  score: number;

  constructor() {}

  ngOnInit() {
    this.score = Number(sessionStorage.getItem('score')) || -1;
  }

  copyLink(val) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    selBox.setAttribute('readonly', 'true');
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    selBox.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(selBox);
    // another way to write to clipboard  but idk if the above one already works
    navigator.clipboard.writeText(val);
  }
}
