import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchStashComponent } from './branch-stash.component';

describe('BranchStashComponent', () => {
  let component: BranchStashComponent;
  let fixture: ComponentFixture<BranchStashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BranchStashComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchStashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
