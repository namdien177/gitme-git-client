import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitOptionsComponent } from './commit-options.component';

describe('CommitOptionsComponent', () => {
  let component: CommitOptionsComponent;
  let fixture: ComponentFixture<CommitOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommitOptionsComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
