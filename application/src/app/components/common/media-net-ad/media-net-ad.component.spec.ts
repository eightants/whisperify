import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaNetAdComponent } from './media-net-ad.component';

describe('MediaNetAdComponent', () => {
  let component: MediaNetAdComponent;
  let fixture: ComponentFixture<MediaNetAdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaNetAdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaNetAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
