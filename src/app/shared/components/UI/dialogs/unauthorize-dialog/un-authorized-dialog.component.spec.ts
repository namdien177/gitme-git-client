import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnAuthorizedDialogComponent } from './un-authorized-dialog.component';

describe('UnauthorizeDialogComponent', () => {
  let component: UnAuthorizedDialogComponent;
  let fixture: ComponentFixture<UnAuthorizedDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnAuthorizedDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnAuthorizedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
