import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationCommitInfoComponent } from './navigation-commit-info.component';

describe('NavigationCommitInfoComponent', () => {
  let component: NavigationCommitInfoComponent;
  let fixture: ComponentFixture<NavigationCommitInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigationCommitInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationCommitInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
