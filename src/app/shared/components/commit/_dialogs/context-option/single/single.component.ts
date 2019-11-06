import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';
import { FileStatusSummaryView } from '../../../../../state/DATA/repository-status';
import { RepositoryBranchesService } from '../../../../../state/DATA/repository-branches';
import { Repository } from '../../../../../state/DATA/repositories';
import { FileSystemService } from '../../../../../../services/system/fileSystem.service';

@Component({
    selector: 'gitme-single',
    templateUrl: './single.component.html',
    styleUrls: ['./single.component.scss']
})
export class SingleComponent implements OnInit {

    extension = '';
    private readonly file: FileStatusSummaryView;
    private readonly repository: Repository;

    constructor(
        private fileSystemService: FileSystemService,
        private branchServices: RepositoryBranchesService,
        private _bottomSheetRef: MatBottomSheetRef<SingleComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
            file: FileStatusSummaryView,
            repository: Repository
        },
    ) {
        this.file = data.file;
        this.repository = data.repository;
        if (!this.file || !this.repository) {
            this.dismissed();
        }
    }

    ngOnInit() {
        const splitPath = this.data.file.path.split('.');
        this.extension = splitPath[splitPath.length - 1];
    }

    dismissed(action: ACTION_ON_FILE = 'CANCEL') {
        this._bottomSheetRef.dismiss(action);
    }

    revertChanges() {
        const singleFileArr: FileStatusSummaryView[] = [this.file];
        this.branchServices.revertFiles(this.repository, singleFileArr).subscribe(
            result => {
                this.dismissed('REVERT');
            }
        );
    }

    openFileLocation() {
        this.fileSystemService.openFolderOf(this.repository.directory, this.file.path);
        this.dismissed('OPEN_FOLDER');
    }

    copyPath(relative: boolean = false) {
        if (relative) {
            this.fileSystemService.copyPath(relative, this.file.path);
        } else {
            this.fileSystemService.copyPath(relative, this.repository.directory, this.file.path);
        }
    }

    ignoreThisFile() {
        this.branchServices.ignoreFile(this.repository, this.file)
        .subscribe(
            status => {
                this.dismissed('IGNORED');
            }
        );
    }
}

export type ACTION_ON_FILE = 'OPEN_FOLDER' | 'REVERT' | 'CANCEL' | 'IGNORED';
