import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchNewOptionComponent } from './branch-new-option.component';

describe('BranchNewOptionComponent', () => {
  let component: BranchNewOptionComponent;
  let fixture: ComponentFixture<BranchNewOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BranchNewOptionComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchNewOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
