import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationRepositoriesComponent } from './navigation-repositories.component';

describe('SideBarComponent', () => {
  let component: NavigationRepositoriesComponent;
  let fixture: ComponentFixture<NavigationRepositoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigationRepositoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationRepositoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
