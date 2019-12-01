import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizeDialogComponent } from './unauthorize-dialog.component';

describe('UnauthorizeDialogComponent', () => {
  let component: UnauthorizeDialogComponent;
  let fixture: ComponentFixture<UnauthorizeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnauthorizeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnauthorizeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
