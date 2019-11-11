import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchRenameComponent } from './branch-rename.component';

describe('BranchRenameComponent', () => {
  let component: BranchRenameComponent;
  let fixture: ComponentFixture<BranchRenameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchRenameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchRenameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
