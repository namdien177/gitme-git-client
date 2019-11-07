import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YesNoDecisionComponent } from './yes-no-decision.component';

describe('YesNoDecisionComponent', () => {
  let component: YesNoDecisionComponent;
  let fixture: ComponentFixture<YesNoDecisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [YesNoDecisionComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YesNoDecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
