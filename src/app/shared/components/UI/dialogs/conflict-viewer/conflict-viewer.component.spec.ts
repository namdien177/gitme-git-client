import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConflictViewerComponent } from './conflict-viewer.component';

describe('ConflictViewerComponent', () => {
  let component: ConflictViewerComponent;
  let fixture: ComponentFixture<ConflictViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConflictViewerComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConflictViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
