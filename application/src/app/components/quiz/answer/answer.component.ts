import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-answer",
  templateUrl: "./answer.component.html",
  styleUrls: ["./answer.component.scss"],
})
export class AnswerComponent implements OnInit {
  @Output() nextPg = new EventEmitter<string>();
  @Input() isCorrect: any;
  @Input() ind: any;
  @Input() altind: any;
  @Input() tracks: any;
  @Input() mode: any;
  @Input() time: any;
  @Input() partial: any;
  @Input() streak: any;
  @Input() score: any;
  @Input() pointsAdded: any;
  @Input() timePeriod: any;
  @Input() maxVolume: any;
  color = null;

  constructor() {}

  ngOnInit() {}

  nextQues() {
    this.nextPg.next();
  }

  ellipsisName() {
    if (this.tracks[this.ind].name.length > 12) {
      return this.tracks[this.ind].name.slice(0, 11) + "...";
    } else {
      return this.tracks[this.ind].name;
    }
  }

  @ViewChild("answerAudio", { static: false }) source;
  playFull() {
    this.source.nativeElement.load();
    this.source.nativeElement.play();
    this.source.nativeElement.volume = this.maxVolume;
  }

  stopFull() {
    this.source.nativeElement.pause();
  }

  rankStr(num) {
    num = num.toString();
    if (num == "1") {
      return "";
    } else if (num == "2") {
      return num + "nd";
    } else if (num == "3") {
      return num + "rd";
    } else if (num.length == 1) {
      return num + "th";
    } else if (num[num.length - 1] == "1" && num[num.length - 2] != "1") {
      return num + "st";
    } else if (num[num.length - 1] == "2" && num[num.length - 2] != "1") {
      return num + "nd";
    } else if (num[num.length - 1] == "3" && num[num.length - 2] != "1") {
      return num + "rd";
    } else {
      return num + "th";
    }
  }
}
