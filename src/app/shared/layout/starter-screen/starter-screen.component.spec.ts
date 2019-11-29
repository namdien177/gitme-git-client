import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StarterScreenComponent } from './starter-screen.component';

describe('StarterScreenComponent', () => {
  let component: StarterScreenComponent;
  let fixture: ComponentFixture<StarterScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StarterScreenComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StarterScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
