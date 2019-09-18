import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from '../../../utilities/utility.service';
import { RepositoriesMenuService } from '../../../states/UI/repositories-menu';
import { GitService } from '../../../../services/features/git.service';
import { FileSystemService } from '../../../../services/system/fileSystem.service';
import { electronNG, osNode } from '../../../types/types.electron';
import { switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { of } from 'rxjs';
import { DialogsInformation } from '../../../model/DialogsInformation';
import { RepositoriesService, Repository } from '../../../states/DATA/repositories';
import { SecurityService } from '../../../../services/system/security.service';
import { Account, AccountListService } from '../../../states/DATA/account-list';

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
    isCredentialsValid = false;
    credentials: Account = null;

    private readonly electron: typeof electronNG.remote;
    private formFieldBuilder = {
        repo_https: [''],
        repo_dir: [osNode.homedir(), Validators.required],
        repo_dir_display: [osNode.homedir(), Validators.required],
        repo_name: [''],
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
        private securityService: SecurityService
    ) {
        this.electron = electronNG.remote;
    }

    get repo_https() {
        return this.formRegisterRepository.get('repo_https');
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

    cancelAdding() {
        this.repositoriesMenuService.closeRepositoryAddLocalDialog();
    }

    chooseDirectory() {
        this.electron.dialog.showOpenDialog(this.electron.getCurrentWindow(), {
            title: 'Choose directory',
            properties: ['openDirectory'],
            defaultPath: osNode.homedir()
        }, (dir) => {
            let displayDirectory = this.repo_dir_display.value;
            if (Array.isArray(dir) && !!dir[0]) {
                displayDirectory = dir[0];
                this.repo_dir_display.setValue(displayDirectory);
            }
        });
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
                    // TODO: Display error message?
                    this.infoDialogs = {
                        type: 'ERROR',
                        message: 'The directory is invalid!'
                    };
                } else if (repositoryStatus === false) {
                    // Not a git repository
                    // TODO: Display option to create repository
                    this.infoDialogs = {
                        type: 'WARNING',
                        message: 'The directory is not initialized with git'
                    };
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
                name: credentialsInstance.name_local,
            },
            selected: true,
        };

        /**
         * Confirm this will:
         * * Saving credentials and repository into local file database
         * * Update working repository
         * * Fetching new repository => reassign main branch
         */
        this.repositoryService.addExistingLocalRepository(
            repositoryInstance, credentialsInstance, !this.isExistingAccount
        ).subscribe(
            addStatus => {
                console.log(addStatus);
                this.cancelAdding();
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

    private setupNameRepository(viewingDirectory: string) {
        const safeString = this.utilityService.slashFixer(viewingDirectory);
        const arrPaths = safeString.split('/');
        const nameExpected = arrPaths[arrPaths.length - 1];
        this.repo_name.setValue(nameExpected);
        return nameExpected;
    }
}