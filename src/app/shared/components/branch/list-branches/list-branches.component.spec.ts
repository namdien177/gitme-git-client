import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBranchesComponent } from './list-branches.component';

describe('RepoBranchesComponent', () => {
  let component: ListBranchesComponent;
  let fixture: ComponentFixture<ListBranchesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListBranchesComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListBranchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
