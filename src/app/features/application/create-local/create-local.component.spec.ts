import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLocalComponent } from './create-local.component';

describe('CreateLocalComponent', () => {
  let component: CreateLocalComponent;
  let fixture: ComponentFixture<CreateLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
