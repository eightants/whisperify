import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoInfoComponent } from './no-info.component';

describe('NoInfoComponent', () => {
  let component: NoInfoComponent;
  let fixture: ComponentFixture<NoInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
