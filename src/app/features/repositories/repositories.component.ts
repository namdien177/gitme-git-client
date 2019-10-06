import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { RepositoriesMenuService } from '../../shared/state/UI/repositories-menu';

@Component({
    selector: 'gitme-repositories',
    templateUrl: './repositories.component.html',
    styleUrls: ['./repositories.component.scss']
})
export class RepositoriesComponent implements OnInit, OnDestroy {

    isRepositoryBoxOpen = false;
    isBranchBoxOpen = false;
    isViewChangeTo = 'changes';
    private componentDestroyed: Subject<boolean> = new Subject<boolean>();

    constructor(
        private repoMenuService: RepositoriesMenuService
    ) {
        this.watchingUIState(); // observing dropdown list of components
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.componentDestroyed.next(true);
    }

    toggleRepositoryBox() {
        console.log('togg');
        this.repoMenuService.toggleRepositoryMenu(this.isRepositoryBoxOpen);
    }

    toggleBranchBox() {
        this.repoMenuService.toggleBranchMenu(this.isBranchBoxOpen);
    }

    clickOutSide(isOutSide: boolean, button: 'repositories' | 'branches') {
        if (isOutSide) {
            switch (button) {
                case 'branches':
                    if (this.isBranchBoxOpen) {
                        this.repoMenuService.closeBranchMenu();
                    }
                    break;
                case 'repositories':
                    if (this.isRepositoryBoxOpen) {
                        this.repoMenuService.closeRepoMenu();
                    }
                    break;
            }
        }
    }

    private watchingUIState() {
        this.repoMenuService.select().subscribe(state => {
            this.isRepositoryBoxOpen = state.is_repository_open && !!state.is_available;
            this.isBranchBoxOpen = state.is_branch_open && !!state.is_available;
        });
    }

    switchView(toView: string) {
        switch (toView) {
            case 'changes':
            case 'history':
                this.isViewChangeTo = toView;
                break;
            default:
                this.isViewChangeTo = 'changes';
        }
    }
}
