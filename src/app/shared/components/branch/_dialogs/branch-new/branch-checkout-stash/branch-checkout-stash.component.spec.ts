import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchCheckoutStashComponent } from './branch-checkout-stash.component';

describe('BranchCheckoutStashComponent', () => {
  let component: BranchCheckoutStashComponent;
  let fixture: ComponentFixture<BranchCheckoutStashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchCheckoutStashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchCheckoutStashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
