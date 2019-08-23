import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryCloneComponent } from './repository-clone.component';

describe('RepoAddComponent', () => {
    let component: RepositoryCloneComponent;
    let fixture: ComponentFixture<RepositoryCloneComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RepositoryCloneComponent]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RepositoryCloneComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
