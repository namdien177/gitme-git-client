import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionLoadComponent } from './section-load.component';

describe('SectionLoadComponent', () => {
  let component: SectionLoadComponent;
  let fixture: ComponentFixture<SectionLoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SectionLoadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
