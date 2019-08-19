import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from '../../utilities/utility.service';
import { RepositoriesMenuService } from '../../states/repositories-menu';
import { GitService } from '../../../services/features/git.service';
import { FileSystemService } from '../../../services/system/fileSystem.service';
import { electronNG, osNode } from '../../types/types.electron';

@Component({
  selector: 'gitme-repository-add-local',
  templateUrl: './repository-add-local.component.html',
  styleUrls: ['./repository-add-local.component.scss']
})
export class RepositoryAddLocalComponent implements OnInit {

  formRegisterRepository: FormGroup;
  directoryVerified = false;
  illuminateValue_dir: string = osNode.homedir();
  isExistingAccount = true;
  credentialsFormValid = false;

  private readonly electron: typeof electronNG.remote;
  private formFieldBuilder = {
    repo_https: [''],
    repo_dir: [osNode.homedir(), Validators.required],
    repo_dir_display: [osNode.homedir(), Validators.required],
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
    this.gitPackService.isGitProject('').then(val => {
      console.log(val);
    });

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
    this.repo_dir_display.valueChanges.subscribe(newVal => {
      if (!!newVal) {
        const safeDir = this.utilityService.directorySafePath(newVal);
        if (safeDir) {
          this.repo_dir.setValue(safeDir);
        }
      }
      console.log(newVal);
    });

    this.repo_dir.valueChanges.subscribe(newVal => {
      console.log(newVal);
      if (!!newVal && this.fileSystemService.isDirectoryExist(newVal)) {
        // TODO valid directory? Need check git
        // Check git
        this.gitPackService.isGitProject(newVal).then(result => console.log(result));
      } else {
        // TODO invalid directory? can create afterward and init
      }
// const displayPath = this.utilityService.directorySafePath()
    });
  }
}
