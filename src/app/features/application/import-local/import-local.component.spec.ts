import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportLocalComponent } from './import-local.component';

describe('ImportLocalComponent', () => {
  let component: ImportLocalComponent;
  let fixture: ComponentFixture<ImportLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportLocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
