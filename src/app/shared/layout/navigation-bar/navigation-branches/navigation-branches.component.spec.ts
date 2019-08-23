import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationBranchesComponent } from './navigation-branches.component';

describe('RepoBranchesComponent', () => {
    let component: NavigationBranchesComponent;
    let fixture: ComponentFixture<NavigationBranchesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NavigationBranchesComponent]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavigationBranchesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
