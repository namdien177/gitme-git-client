import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoBranchesComponent } from './repo-branches.component';

describe('RepoBranchesComponent', () => {
  let component: RepoBranchesComponent;
  let fixture: ComponentFixture<RepoBranchesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepoBranchesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepoBranchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
