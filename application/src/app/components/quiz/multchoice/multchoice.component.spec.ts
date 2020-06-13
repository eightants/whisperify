import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultchoiceComponent } from './multchoice.component';

describe('MultchoiceComponent', () => {
  let component: MultchoiceComponent;
  let fixture: ComponentFixture<MultchoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultchoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultchoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
