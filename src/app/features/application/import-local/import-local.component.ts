import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account, AccountListService } from '../../../shared/state/DATA/accounts';
import { electronNode, osNode } from '../../../shared/types/types.electron';
import { RepositoriesService, Repository } from '../../../shared/state/DATA/repositories';
import { UtilityService } from '../../../shared/utilities/utility.service';
import { GitService } from '../../../services/features/git.service';
import { FileSystemService } from '../../../services/system/fileSystem.service';
import { SecurityService } from '../../../services/system/security.service';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Router } from '@angular/router';
import { IsAValidDirectory, IsRepository, shouldNotExistInArray } from '../../../shared/validate/customFormValidate';
import { debounceTime } from 'rxjs/operators';

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
    private formBuilder: FormBuilder,
    private accountListService: AccountListService,
    private repositoryService: RepositoriesService,
    private utilityService: UtilityService,
    private gitPackService: GitService,
    private fileSystemService: FileSystemService,
    private cd: ChangeDetectorRef,
    private securityService: SecurityService,
    private router: Router
  ) {
    this.electron = electronNode.remote;
    this.listRepository = this.repositoryService.get();
    this.listAccount = this.accountListService.getSync();
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
    this.formRegisterRepository = this.formBuilder.group({
      repository_directory: [
        osNode.homedir(), [
          Validators.required,
          IsAValidDirectory(this.fileSystemService),
          shouldNotExistInArray(this.listRepository.map(re => re.directory))
        ],
        IsRepository(this.gitPackService),
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
      this.fileSystemService.isDirectoryExist(this.repository_directory.value)
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
      id: this.securityService.randomID,
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
    fromPromise(this.repositoryService.insertNewRepository(
      repositoryInstance,
      credentialsInstance,
      !isExistedOnDB
      // !this.isListAccountTab
    )).subscribe(
      addStatus => {
        this.repository_register_error = null;
        this.cancel();
      }, error => {
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
      const safeDir = this.utilityService.directorySafePath(rawDirectory);
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
    const safeString = this.utilityService.slashFixer(viewingDirectory);
    const arrPaths = safeString.split('/');
    let nameExpected = await this.gitPackService.getRepositoryName(arrPaths);
    if (!nameExpected) {
      nameExpected = arrPaths[arrPaths.length - 1];
    }
    this.repo_name.setValue(nameExpected, { emitEvent: false });
    this.cd.detectChanges();
    return nameExpected;
  }

}
