import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryAddLocalComponent } from './repository-add-local.component';

describe('RepositoryAddLocalComponent', () => {
  let component: RepositoryAddLocalComponent;
  let fixture: ComponentFixture<RepositoryAddLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoryAddLocalComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoryAddLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
