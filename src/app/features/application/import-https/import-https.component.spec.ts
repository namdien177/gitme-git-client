import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportHttpsComponent } from './import-https.component';

describe('ImportHttpsComponent', () => {
  let component: ImportHttpsComponent;
  let fixture: ComponentFixture<ImportHttpsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportHttpsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportHttpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
