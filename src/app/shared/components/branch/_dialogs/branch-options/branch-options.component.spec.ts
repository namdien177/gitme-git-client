import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchOptionsComponent } from './branch-options.component';

describe('BranchOptionsComponent', () => {
  let component: BranchOptionsComponent;
  let fixture: ComponentFixture<BranchOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BranchOptionsComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
