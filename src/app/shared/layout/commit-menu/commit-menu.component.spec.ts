import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitMenuComponent } from './commit-menu.component';

describe('CommitMenuComponent', () => {
  let component: CommitMenuComponent;
  let fixture: ComponentFixture<CommitMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommitMenuComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
