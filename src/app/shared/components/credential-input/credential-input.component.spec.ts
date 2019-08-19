import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialInputComponent } from './credential-input.component';

describe('CredentialInputComponent', () => {
  let component: CredentialInputComponent;
  let fixture: ComponentFixture<CredentialInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CredentialInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CredentialInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
