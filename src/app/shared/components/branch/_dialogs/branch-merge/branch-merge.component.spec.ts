import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchMergeComponent } from './branch-merge.component';

describe('BranchMergeComponent', () => {
  let component: BranchMergeComponent;
  let fixture: ComponentFixture<BranchMergeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchMergeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchMergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
