import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from '../../../utilities/utility.service';
import { RepositoriesMenuService } from '../../../state/UI/repositories-menu';
import { GitService } from '../../../../services/features/git.service';
import { FileSystemService } from '../../../../services/system/fileSystem.service';
import { electronNode, osNode } from '../../../types/types.electron';
import { switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { of } from 'rxjs';
import { DialogsInformation } from '../../../model/DialogsInformation';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { SecurityService } from '../../../../services/system/security.service';
import { Account, AccountListService } from '../../../state/DATA/account-list';
import { Router } from '@angular/router';

@Component({
  selector: 'gitme-repository-add-local',
  templateUrl: './repository-add-local.component.html',
  styleUrls: ['./repository-add-local.component.scss']
})
export class RepositoryAddLocalComponent implements OnInit {

  formRegisterRepository: FormGroup;
  isExistingAccount = true;

  infoDialogs: DialogsInformation = {
    type: null,
    message: null
  };

  needCreateNewGitDirectory = false;

  /**
   * Identify credentials
   */
  credentials: Account = null;

  private readonly electron: typeof electronNode.remote;
  private formFieldBuilder = {
    repo_dir: [osNode.homedir(), Validators.required],
    repo_dir_display: [osNode.homedir(), Validators.required],
    repo_name: ['', [Validators.required, Validators.minLength(1)]],
    repo_account: [null, [Validators.required]]
  };

  constructor(
    private formBuilder: FormBuilder,
    private accountListService: AccountListService,
    private repositoryService: RepositoriesService,
    private utilityService: UtilityService,
    private repositoriesMenuService: RepositoriesMenuService,
    private gitPackService: GitService,
    private fileSystemService: FileSystemService,
    private cd: ChangeDetectorRef,
    private securityService: SecurityService,
    private router: Router
  ) {
    this.electron = electronNode.remote;
  }

  get repo_name() {
    return this.formRegisterRepository.get('repo_name');
  }

  get repo_dir_display() {
    return this.formRegisterRepository.get('repo_dir_display');
  }

  get repo_account() {
    return this.formRegisterRepository.get('repo_account');
  }

  get repo_dir() {
    return this.formRegisterRepository.get('repo_dir');
  }

  ngOnInit() {
    this.formRegisterRepository = this.formBuilder.group(this.formFieldBuilder);
    this.listenerDirectory();
  }

  cancelDialogAdding() {
    this.repositoriesMenuService.closeRepositoryAddLocalDialog();
  }

  chooseDirectory() {
    const dir = this.electron.dialog.showOpenDialog(this.electron.getCurrentWindow(), {
      title: 'Choose directory',
      properties: ['openDirectory'],
      defaultPath: osNode.homedir()
    });

    let displayDirectory = this.repo_dir_display.value;
    if (Array.isArray(dir) && !!dir[0]) {
      displayDirectory = dir[0];
      this.repo_dir_display.setValue(displayDirectory);
    }
  }

  listenerDirectory() {
    this.repo_dir_display.valueChanges
    .subscribe(
      viewingDirectory => {
        this.convertDisplayDirectoryToSafeDirectory(viewingDirectory);
      }
    );

    this.repo_dir.valueChanges
    .pipe(
      switchMap(directorySafe => {
        return this.checkIfGitDirectory(directorySafe);
      }),
    )
    .subscribe(
      repositoryStatus => {
        this.infoDialogs = {
          type: null,
          message: null
        };
        if (repositoryStatus === null) {
          // Not valid repository
          this.infoDialogs = {
            type: 'ERROR',
            message: 'The directory is invalid!'
          };
        } else if (repositoryStatus === false) {
          // Not a git repository
          this.infoDialogs = {
            type: 'WARNING',
            message: 'The directory is not initialized with git'
          };
          this.needCreateNewGitDirectory = true;
        } else {
          // Is a valid repository

        }

        this.cd.detectChanges();
      }
    );
  }

  listenAccount(account: Account) {
    this.repo_account.setValue(account);
  }

  submitNewRepository() {
    if (this.formRegisterRepository.invalid) {
      return;
    }

    const credentialsInstance: Account = <Account>this.repo_account.value;

    const repositoryInstance: Repository = {
      id: this.securityService.randomID,
      name: this.repo_name.value,
      directory: this.repo_dir.value,
      credential: {
        id_credential: credentialsInstance.id,
        name: credentialsInstance.name,
      },
      selected: true,
    };

    /**
     * Confirm this will:
     * * Saving credentials and repository into local file database
     * * Update working repository
     * * Fetching new repository => reassign main branch
     */
    fromPromise(this.repositoryService.insertNewRepository(
      repositoryInstance, credentialsInstance, !this.isExistingAccount
    )).subscribe(
      addStatus => {
        if (addStatus.status) {
          this.router.navigateByUrl('/');
        }
        this.cancelDialogAdding();
      }
    );
  }

  private checkIfGitDirectory(directory: string) {
    /**
     * Check if directory exist
     */
    if (!!directory && this.fileSystemService.isDirectoryExist(directory)) {
      /**
       * Then check if it's a git repo already
       */
      return fromPromise(this.gitPackService.isGitProject(directory));
    } else {
      return of(null);
    }
  }

  private convertDisplayDirectoryToSafeDirectory(rawDirectory: string) {
    if (!!rawDirectory) {
      const safeDir = this.utilityService.directorySafePath(rawDirectory);
      if (safeDir) {
        this.repo_dir.setValue(safeDir);
        this.setupNameRepository(rawDirectory);
      } else {
        this.repo_dir.setValue(null);
        this.repo_name.setValue(null);
      }
    } else {
      this.repo_dir.setValue(null);
      this.repo_name.setValue(null);
    }
  }

  private async setupNameRepository(viewingDirectory: string) {
    const safeString = this.utilityService.slashFixer(viewingDirectory);
    const arrPaths = safeString.split('/');
    let nameExpected = await this.gitPackService.getRepositoryName(arrPaths);
    if (!nameExpected) {
      nameExpected = arrPaths[arrPaths.length - 1];
    }
    this.repo_name.setValue(nameExpected);
    return nameExpected;
  }
}
