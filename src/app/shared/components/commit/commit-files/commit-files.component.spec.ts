import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitFilesComponent } from './commit-files.component';

describe('CommitFilesComponent', () => {
  let component: CommitFilesComponent;
  let fixture: ComponentFixture<CommitFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommitFilesComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
