import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoAddComponent } from './repo-add.component';

describe('RepoAddComponent', () => {
  let component: RepoAddComponent;
  let fixture: ComponentFixture<RepoAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepoAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepoAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
