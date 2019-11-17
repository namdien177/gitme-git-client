import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';
import { FileStatusSummaryView } from '../../../../../state/DATA/repository-status';
import { RepositoryBranchesService } from '../../../../../state/DATA/branches';
import { RepositoriesService, Repository } from '../../../../../state/DATA/repositories';
import { FileSystemService } from '../../../../../../services/system/fileSystem.service';
import { fromPromise } from 'rxjs/internal-compatibility';
import { switchMap } from 'rxjs/operators';

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
    private repositoryServices: RepositoriesService,
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

  get ignoreStatus(): boolean {
    const forbidden = /[\/\\]*\.gitignore$/g;
    return !this.file.path.match(forbidden);
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
    fromPromise(this.branchServices.revertFiles(this.repository, singleFileArr))
    .pipe(
      switchMap(() => fromPromise(this.branchServices.updateAll(this.data.repository))),
      switchMap(branches => fromPromise(this.repositoryServices.updateToDataBase(this.data.repository, branches)))
    )
    .subscribe(
      () => {
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
    fromPromise(this.branchServices.ignoreFiles(this.repository, this.file))
    .pipe(
      switchMap(() => fromPromise(this.branchServices.updateAll(this.data.repository))),
      switchMap(branches => fromPromise(this.repositoryServices.updateToDataBase(this.data.repository, branches)))
    )
    .subscribe(() => {
      this.dismissed('IGNORED');
    });
  }

  ignoreThisExtension() {
    fromPromise(this.branchServices.ignoreExtension(this.repository, this.file))
    .pipe(
      switchMap(() => fromPromise(this.branchServices.updateAll(this.data.repository))),
      switchMap(branches => fromPromise(this.repositoryServices.updateToDataBase(this.data.repository, branches)))
    )
    .subscribe(() => {
      this.dismissed('IGNORED');
    });
  }
}

export type ACTION_ON_FILE = 'OPEN_FOLDER' | 'REVERT' | 'CANCEL' | 'IGNORED';
