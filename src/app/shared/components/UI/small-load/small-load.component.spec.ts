import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallLoadComponent } from './small-load.component';

describe('SmallLoadComponent', () => {
  let component: SmallLoadComponent;
  let fixture: ComponentFixture<SmallLoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmallLoadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
