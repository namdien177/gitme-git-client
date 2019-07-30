import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowsFrameComponent } from './windows-frame.component';

describe('WindowsFrameComponent', () => {
  let component: WindowsFrameComponent;
  let fixture: ComponentFixture<WindowsFrameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WindowsFrameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindowsFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
