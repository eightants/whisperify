import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

declare var RadarChart: any;

@Component({
  selector: 'app-radar-chart',
  templateUrl: './radar-chart.component.html',
  styleUrls: ['./radar-chart.component.scss']
})
export class RadarChartComponent implements OnInit {
  @Input() inputId: any;
  @Input() data: any;
  @Input() config: any;
  @Input() changed: any;
  @Input() graphClr: any;

  constructor() { }

  ngOnInit() {
    if (this.graphClr) {
      this.config.color = d3.scaleOrdinal().range([this.graphClr]);
    }
  }

  ngAfterViewInit() {
    RadarChart("#" + this.inputId, this.data, this.config);
  }

  ngOnChanges(changes: SimpleChanges) {
    //console.log(changes)
    if (this.config && this.data) {
      RadarChart("#" + this.inputId, this.data, this.config);
    }
  }

}
