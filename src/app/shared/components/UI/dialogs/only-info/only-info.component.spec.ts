import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlyInfoComponent } from './only-info.component';

describe('OnlyInfoComponent', () => {
  let component: OnlyInfoComponent;
  let fixture: ComponentFixture<OnlyInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlyInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
