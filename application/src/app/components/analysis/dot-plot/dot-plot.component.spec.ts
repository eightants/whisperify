import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DotPlotComponent } from './dot-plot.component';

describe('DotPlotComponent', () => {
  let component: DotPlotComponent;
  let fixture: ComponentFixture<DotPlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DotPlotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DotPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
