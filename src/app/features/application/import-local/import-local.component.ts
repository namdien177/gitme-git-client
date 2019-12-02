import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account, AccountListService } from '../../../shared/state/DATA/accounts';
import { electronNode, osNode } from '../../../shared/types/types.electron';
import { RepositoriesService, Repository } from '../../../shared/state/DATA/repositories';
import { UtilityService } from '../../../shared/utilities/utility.service';
import { GitService } from '../../../services/features/core/git.service';
import { FileSystemService } from '../../../services/system/fileSystem.service';
import { SecurityService } from '../../../services/system/security.service';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Router } from '@angular/router';
import { IsAValidDirectory, IsRepository, shouldNotExistInArray } from '../../../shared/validate/customFormValidate';
import { debounceTime, filter, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LoadingIndicatorService } from '../../../shared/state/UI/Loading-Indicator';

@Component({
  selector: 'gitme-import-local',
  templateUrl: './import-local.component.html',
  styleUrls: ['./import-local.component.scss']
})
export class ImportLocalComponent implements OnInit {

  formRegisterRepository: FormGroup;
  isListAccountTab = true;

  needCreateNewGitDirectory = false;
  repository_register_error = null;

  listAccount: Account[] = [];
  listRepository: Repository[] = [];

  private readonly electron: typeof electronNode.remote;

  constructor(
    private fb: FormBuilder,
    private account: AccountListService,
    private repository: RepositoriesService,
    private utilities: UtilityService,
    private git: GitService,
    private fsSystem: FileSystemService,
    private cd: ChangeDetectorRef,
    private security: SecurityService,
    private router: Router,
    private ld: LoadingIndicatorService
  ) {
    this.electron = electronNode.remote;
    this.listRepository = this.repository.get();
    this.listAccount = this.account.getSync();
  }

  get repo_name() {
    return this.formRegisterRepository.get('repo_name');
  }

  get repo_account() {
    return this.formRegisterRepository.get('repo_account');
  }

  get repository_directory() {
    return this.formRegisterRepository.get('repository_directory');
  }

  ngOnInit() {
    this.formRegisterRepository = this.fb.group({
      repository_directory: [
        osNode.homedir(), [
          Validators.required,
          IsAValidDirectory(this.fsSystem),
          shouldNotExistInArray(this.listRepository.map(re => re.directory))
        ],
        IsRepository(this.git),
      ],
      repo_name: [
        '', [Validators.required, Validators.minLength(1)]
      ],
      repo_account: [
        null, [Validators.required]
      ]
    });

    this.formRegisterRepository.valueChanges.pipe(
      debounceTime(100)
    ).subscribe(() => {
      // reset global error
      this.repository_register_error = null;
    });
  }

  cancel() {
    this.router.navigateByUrl('/');
  }

  chooseDirectory() {
    let openDir = osNode.homedir();
    if (
      this.repository_directory.value &&
      this.fsSystem.isDirectoryExist(this.repository_directory.value)
    ) {
      openDir = this.repository_directory.value;
    }
    const dir = this.electron.dialog.showOpenDialogSync({
      title: 'Choose directory',
      properties: ['openDirectory'],
      defaultPath: openDir,
      buttonLabel: 'Select'
    });
    if (Array.isArray(dir) && !!dir[0]) {
      this.convertDisplayDirectoryToSafeDirectory(dir[0]);
    }
  }

  listenAccount(account: Account, cached = false) {
    this.repo_account.setValue(account);
  }

  submitNewRepository() {
    if (this.formRegisterRepository.invalid) {
      return;
    }
    const credentialsInstance: Account = <Account>this.repo_account.value;
    const repositoryInstance: Repository = {
      id: this.security.randomID,
      name: this.repo_name.value,
      directory: this.repository_directory.value,
      credential: {
        id_credential: credentialsInstance.id,
        name: credentialsInstance.name,
      },
      selected: true,
    };

    const isExistedOnDB = !!this.listAccount
    .find(account => account.id === credentialsInstance.id);

    /**
     * Confirm this will:
     * * Saving credentials and repository into local file database
     * * Update working repository
     * * Fetching new repository => reassign main branch.
     */
    this.repository_register_error = null;
    this.ld.setLoading('Checking authorize account');
    fromPromise(this.git.getRemoteTracking(repositoryInstance.directory)).pipe(
      filter(r => {
        if (!r) {
          this.ld.setFinish();
          this.repository_register_error = ' Unable to get information of the repository';
        }
        return !!r;
      }),
      switchMap(remote => {
        const remoteOrigin = remote.find(r => r.name === 'origin');
        if (!remoteOrigin) {
          return of(null);
        }
        return fromPromise(this.git.checkRemote(remoteOrigin.fetch, credentialsInstance));
      }),
      switchMap(isAuthorize => {
        if (isAuthorize) {
          return of(true);
        }
        this.ld.setFinish();
        this.repository_register_error = 'The remote repository does not exist. Either the account not authorized or the repository URL not correct';
        return of(null);
      }),
      filter(stats => !!stats),
      switchMap(() => fromPromise(this.repository.createNew(
        repositoryInstance,
        credentialsInstance,
        !isExistedOnDB
      ))),
    ).subscribe(
      addStatus => {
        this.ld.setFinish();
        this.repository_register_error = null;
        this.cancel();
      }, error => {
        this.ld.setFinish();
        this.repository_register_error = 'Register a new repository failed, please try again!';
        console.log(error);
      }
    );
  }

  switchAccountChooseMode(value: boolean) {
    this.isListAccountTab = value;
    this.repo_account.reset(null);
  }

  private convertDisplayDirectoryToSafeDirectory(rawDirectory: string) {
    if (!!rawDirectory) {
      const safeDir = this.utilities.directorySafePath(rawDirectory);
      if (safeDir) {
        this.repository_directory.setValue(safeDir);
        this.repository_directory.markAsDirty();
        this.setupNameRepository(rawDirectory);
        return;
      }
    }
    this.repository_directory.setValue(rawDirectory);
    this.repo_name.setValue(null);
  }

  private async setupNameRepository(viewingDirectory: string) {
    const safeString = this.utilities.slashFixer(viewingDirectory);
    const arrPaths = safeString.split('/');
    let nameExpected = await this.git.getName(arrPaths);
    if (!nameExpected) {
      nameExpected = arrPaths[arrPaths.length - 1];
    }
    this.repo_name.setValue(nameExpected, { emitEvent: false });
    this.cd.detectChanges();
    return nameExpected;
  }

}
