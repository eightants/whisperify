import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateQuizPopupComponent } from './generate-quiz-popup.component';

describe('GenerateQuizPopupComponent', () => {
  let component: GenerateQuizPopupComponent;
  let fixture: ComponentFixture<GenerateQuizPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateQuizPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateQuizPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
