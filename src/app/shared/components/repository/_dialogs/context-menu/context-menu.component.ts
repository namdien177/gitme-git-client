import { Component, Inject } from '@angular/core';
import { RepositoriesService, Repository } from '../../../../state/DATA/repositories';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';
import { FileSystemService } from '../../../../../services/system/fileSystem.service';
import { DataService } from '../../../../../services/features/core/data.service';
import { SecurityService } from '../../../../../services/system/security.service';
import { fsNode } from '../../../../types/types.electron';
import { DefineCommon } from '../../../../../common/define.common';
import { fromPromise } from 'rxjs/internal-compatibility';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { RepositoryStatusService } from '../../../../state/DATA/repository-status';
import { RepositoryBranchesService } from '../../../../state/DATA/branches';
import { GitDiffService } from '../../../../state/DATA/git-diff';

@Component({
  selector: 'gitme-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class ContextMenuComponent {

  fs = fsNode;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ContextMenuComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
      repository: Repository
    },
    private fileSystem: FileSystemService,
    private dataService: DataService,
    private securityService: SecurityService,
    private repoService: RepositoriesService,
    private statusService: RepositoryStatusService,
    private branchesService: RepositoryBranchesService,
    private diffService: GitDiffService,
    private router: Router
  ) {
  }

  openFolder() {
    this.fileSystem.openFolderOf(this.data.repository.directory);
    this._bottomSheetRef.dismiss();
  }

  removeFromDataBase() {
    fromPromise(this.removeLocalData())
    .pipe(
      switchMap((status) => {
        this.repoService.reset();
        this.statusService.reset();
        this.branchesService.reset();
        this.diffService.reset();
        console.log(status);
        return fromPromise(this.repoService.loadFromDataBase(true));
      })
    )
    .subscribe((listRepo) => {
      if (listRepo.length === 0) {
        this.router.navigateByUrl('/application');
      }
      this._bottomSheetRef.dismiss();
    });
  }

  async removeLocalData() {
    const configID = this.securityService.appUUID;
    const repoID = this.data.repository.id;
    // unlink from app config
    const appConfig = await this.dataService.getConfigAppData(configID);
    appConfig.repository_config = appConfig.repository_config.filter(id => {
      return id !== repoID;
    });
    let updateConfig;
    try {
      updateConfig = await this.dataService.updateAppConfigFile(appConfig, configID);
    } catch (e) {
      console.log(e);
      updateConfig = false;
    }
    if (!updateConfig) {
      // inform failure
      return updateConfig;
    }

    // unlink file
    let removeInfo = false;
    try {
      const dataRepoFile = await this.dataService.getRepositoriesConfigData(repoID);
      if (dataRepoFile) {
        const directory = DefineCommon.ROOT + DefineCommon.DIR_REPOSITORIES(repoID);
        removeInfo = await this.fileSystem.removeFile(directory);
      }
    } catch (e) {
      console.log(e);
      removeInfo = false;
    }

    return removeInfo;
  }
}
