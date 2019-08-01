import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XTerminalComponent } from './x-terminal.component';

describe('XTerminalComponent', () => {
  let component: XTerminalComponent;
  let fixture: ComponentFixture<XTerminalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XTerminalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
