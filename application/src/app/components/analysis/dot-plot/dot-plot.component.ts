import { Component, OnInit, Input } from '@angular/core';

declare let DotPlot: any;

@Component({
  selector: 'app-dot-plot',
  templateUrl: './dot-plot.component.html',
  styleUrls: ['./dot-plot.component.scss'],
})
export class DotPlotComponent implements OnInit {
  @Input() inputId: any;
  @Input() data: any;
  @Input() config: any;
  @Input() changed: any;
  @Input() graphClr: any;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    DotPlot('#' + this.inputId, this.data, this.config);
  }

  ngOnChanges() {
    if (this.config && this.data) {
      DotPlot('#' + this.inputId, this.data, this.config);
    }
  }
}
