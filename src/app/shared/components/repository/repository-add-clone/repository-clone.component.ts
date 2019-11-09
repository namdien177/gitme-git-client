import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { electronNode, osNode } from '../../../types/types.electron';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UtilityService } from '../../../utilities/utility.service';
import { RepositoriesMenuService } from '../../../state/UI/repositories-menu';
import { GitService } from '../../../../services/features/git.service';
import { FileSystemService } from '../../../../services/system/fileSystem.service';

@Component({
  selector: 'gitme-repository-clone',
  templateUrl: './repository-clone.component.html',
  styleUrls: ['./repository-clone.component.scss']
})
export class RepositoryCloneComponent implements OnInit, AfterViewInit {

  formRegisterRepository: FormGroup;
  directoryVerified = false;
  illuminateValue_dir: string = osNode.homedir();
  isExistingAccount = true;

  private readonly electron: typeof electronNode.remote;
  private formFieldBuilder = {
    repo_https: [''],
    repo_dir: [osNode.homedir()],
    repo_dir_display: [osNode.homedir()],
    repo_name: [''],
    repo_account: [{
      username: '',
      password: ''
    }]
  };

  constructor(
    private formBuilder: FormBuilder,
    private utilityService: UtilityService,
    private repositoriesMenuService: RepositoriesMenuService,
    private gitPackService: GitService,
    private fileSystemService: FileSystemService,
    private cd: ChangeDetectorRef
  ) {
    this.electron = electronNode.remote;
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
  }

  ngAfterViewInit(): void {
    this.formListener();
  }

  chooseDirectory() {
    const dir = this.electron.dialog.showOpenDialog(this.electron.getCurrentWindow(), {
      title: 'Choose clone repository',
      properties: ['openDirectory'],
      defaultPath: osNode.homedir()
    });

    let dirSafe = this.repo_dir.value;
    if (Array.isArray(dir) && !!dir[0]) {
      dirSafe = dir[0];
    }
    if (dirSafe) {
      this.repo_dir.setValue(dirSafe);
    }
  }

  cancelAdding(isOutSide: boolean = false) {
    if (isOutSide) {
      this.repositoriesMenuService.closeRepositoryCloneDialog();
    }
  }

  formListener() {
    this.formRegisterRepository.valueChanges.subscribe(
      (formFields: any) => {
        this.checkingStepOneRepo(formFields);
      }
    );
  }

  checkingStepOneRepo(formField: { [key: string]: string }) {
    let dirDisplay = formField.repo_dir;
    if (!!formField.repo_https) {
      let testName = this.utilityService.repositoryNameFromHTTPS(formField.repo_https);
      if (testName) {
        if (dirDisplay[dirDisplay.length - 1] !== '\\') {
          testName = '\\' + testName;
        }
        dirDisplay += testName;
      }
    }
    if (this.repo_dir_display.value !== dirDisplay) {
      this.illuminateValue_dir = dirDisplay;
      this.repo_dir_display.setValue(dirDisplay);
      this.cd.detectChanges();
    }
  }

  test() {
    // const safeHTTPS = this.repo_https.value;
    // const directory = this.utilityService.directorySafePath(this.repo_dir.value);
    //
    // if (!safeHTTPS) {
    //   return;
    // }
    // const credentials: GitCredentials = {
    //   username: 'do.hoangnam9x@gmail.com',
    // };
    // this.gitPackService.cloneTo(safeHTTPS, directory, credentials)
    // .then(data => {
    //     console.log(data);
    //   },
    //   err => {
    //     console.log(err);
    //   });

    // console.log('start');
    // this.fileSystemService.getFileContext(
    //   'test',
    //   '/user/'
    // ).then(resolve => {
    //   console.log(resolve);
    // }, error => {
    //   console.log(error);
    // }).finally(() => {
    //   console.log('done');
    // });
  }
}
