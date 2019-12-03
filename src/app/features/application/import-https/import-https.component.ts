import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { electronNode, osNode, pathNode } from '../../../shared/types/types.electron';
import { UtilityService } from '../../../shared/utilities/utility.service';
import { GitService } from '../../../services/features/core/git.service';
import { FileSystemService } from '../../../services/system/fileSystem.service';
import { Router } from '@angular/router';
import { Account, AccountListService } from '../../../shared/state/DATA/accounts';
import { RepositoriesService, Repository } from '../../../shared/state/DATA/repositories';
import { SecurityService } from '../../../services/system/security.service';
import { IsAValidDirectory, IsNotRepository, isValidCloneURL, shouldNotExistInArray, } from '../../../shared/validate/customFormValidate';
import { catchError, debounceTime, filter, switchMap, takeWhile } from 'rxjs/operators';
import { merge, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { LoadingIndicatorService } from '../../../shared/state/UI/Loading-Indicator';

@Component({
  selector: 'gitme-import-https',
  templateUrl: './import-https.component.html',
  styleUrls: ['./import-https.component.scss'],
})
export class ImportHttpsComponent implements OnInit {

  formCloneRepository: FormGroup;
  isListAccountTab = true;

  needCreateNewGitDirectory = false;
  repository_register_error = null;

  listAccount: Account[] = [];
  listRepository: Repository[] = [];
  display_directory: string = osNode.homedir();
  private readonly electron: typeof electronNode.remote;

  constructor(
    private fb: FormBuilder,
    private accountState: AccountListService,
    private repositoryState: RepositoriesService,
    private utilities: UtilityService,
    private git: GitService,
    private fsService: FileSystemService,
    private cd: ChangeDetectorRef,
    private security: SecurityService,
    private router: Router,
    private ld: LoadingIndicatorService
  ) {
    this.electron = electronNode.remote;
    this.listRepository = this.repositoryState.get();
    this.listAccount = this.accountState.getSync();
  }

  get repo_name() {
    return this.formCloneRepository.get('repo_name');
  }

  get repo_account() {
    return this.formCloneRepository.get('repo_account');
  }

  get directory() {
    return this.formCloneRepository.get('directory');
  }

  get http() {
    return this.formCloneRepository.get('http');
  }

  ngOnInit() {
    this.formCloneRepository = this.fb.group({
      http: [
        '', [
          Validators.required,
          Validators.minLength(5),
          isValidCloneURL(),
        ],
      ],
      directory: [
        osNode.homedir(), [
          Validators.required,
          IsAValidDirectory(this.fsService),
          shouldNotExistInArray(this.listRepository.map(re => re.directory)),
        ],
        IsNotRepository(this.git),
      ],
      repo_name: [
        '', [Validators.required, Validators.minLength(1)],
      ],
      repo_account: [
        null, [Validators.required],
      ],
    });

    this.observeRepoInfo();

    this.formCloneRepository.valueChanges.pipe(
      debounceTime(100),
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
      this.directory.value &&
      this.fsService.isDirectoryExist(this.directory.value)
    ) {
      openDir = this.directory.value;
    }
    const dir = this.electron.dialog.showOpenDialogSync({
      title: 'Choose clone destination',
      properties: ['openDirectory'],
      defaultPath: openDir,
      buttonLabel: 'Select',
    });
    if (Array.isArray(dir) && !!dir[0]) {
      this.safeDirectory(dir[0]);
    }
  }

  listenAccount(account: Account) {
    this.repo_account.setValue(account);
  }

  submitNewRepository() {
    if (this.formCloneRepository.invalid) {
      return;
    }
    const credentialsInstance: Account = <Account>this.repo_account.value;
    const repositoryInstance: Repository = {
      id: this.security.randomID,
      name: this.repo_name.value,
      directory: this.display_directory,
      credential: {
        id_credential: credentialsInstance.id,
        name: credentialsInstance.name,
      },
      selected: true,
    };

    const isExistedOnDB = !!this.listAccount
    .find(account => account.id === credentialsInstance.id);
    this.repository_register_error = null;
    this.ld.setLoading('Checking authorization');
    fromPromise(this.git.checkRemote(this.http.value, credentialsInstance)).pipe(
      switchMap(isAuthorize => {
        if (isAuthorize) {
          return of(true);
        }
        this.ld.setFinish();
        this.repository_register_error = 'The repository does not exist. Either the account not authorized or the repository URL not correct';
        return of(null);
      }),
      filter(stats => !!stats),
      switchMap(() => {
        this.ld.setLoading('Cloning');
        return fromPromise(this.git.cloneTo(
          this.http.value, this.directory.value + '/', credentialsInstance
        ));
      }),
      catchError(err => {
        // unauthorized or not exist
        console.log(err);
        this.ld.setFinish();
        return of('error');
      }),
      takeWhile((res) => {
        if (res !== undefined && res.length === 0) {
          return true;
        }
        this.ld.setFinish();
        return false;
      }),
      switchMap(() => {
        return fromPromise(this.repositoryState.createNew(
          repositoryInstance,
          credentialsInstance,
          !isExistedOnDB,
        ));
      }),
    ).subscribe(addStatus => {
        this.ld.setFinish();
        this.repository_register_error = null;
        this.cancel();
      }, error => {
        this.ld.setFinish();
        this.repository_register_error = 'Register a new repository failed, please try again!';
        console.log(error);
      },
    );
  }

  switchAccountChooseMode(value: boolean) {
    this.isListAccountTab = value;
    this.repo_account.reset(null);
  }

  private safeDirectory(rawDirectory: string) {
    if (!!rawDirectory) {
      const fixSlash = this.utilities.slashFixer(rawDirectory);
      this.directory.setValue(fixSlash);
      this.directory.markAsDirty();
    }
    this.directory.setValue(rawDirectory);
  }

  private observeRepoInfo() {
    const observeHTTP = this.http.valueChanges;
    const observeDirectory = this.directory.valueChanges;
    merge(observeDirectory, observeHTTP).subscribe(
      () => {
        this.setDirectoryAndName();
      },
    );
  }

  private setDirectoryAndName() {
    const http = <string>this.http.value;
    const directory = <string>this.directory.value;
    this.display_directory = directory;

    if (this.http.valid && this.directory.valid) {
      const nameRepo = this.utilities.repositoryNameFromHTTPS(http);
      if (nameRepo) {
        this.repo_name.setValue(nameRepo);
      }

      if (directory && this.http.valid) {
        if (this.http.valid && nameRepo) {
          this.display_directory = pathNode.join(directory, nameRepo);
        }
      }
    }
  }

}
