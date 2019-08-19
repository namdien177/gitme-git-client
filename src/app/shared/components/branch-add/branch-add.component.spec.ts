import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchAddComponent } from './branch-add.component';

describe('BranchAddComponent', () => {
  let component: BranchAddComponent;
  let fixture: ComponentFixture<BranchAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
