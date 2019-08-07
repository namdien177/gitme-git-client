import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RepositoryState } from '../../../../states/repository';
import { electronNG, nodePty, nodePtyTypeOf, osNode } from '../../../../types/types.electron';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UtilityService } from '../../../../utilities/utility.service';

@Component({
  selector: 'gitme-repository-add',
  templateUrl: './repository-add.component.html',
  styleUrls: ['./repository-add.component.scss']
})
export class RepositoryAddComponent implements OnInit, AfterViewInit {

  @Output() closeStatus: EventEmitter<{
    repository: RepositoryState,
    cancel: boolean
  }> = new EventEmitter<any>();

  formRegisterRepository: FormGroup;
  repo_add_step1_verified = false;
  illuminateValue_dir: string = osNode.homedir();

  private readonly pty: nodePtyTypeOf;
  private readonly electron: typeof electronNG.remote;
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
    private cd: ChangeDetectorRef
  ) {
    this.pty = nodePty;
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
  }

  ngAfterViewInit(): void {
    this.formListener();
  }

  chooseDirectory() {
    this.electron.dialog.showOpenDialog(this.electron.getCurrentWindow(), {
      title: 'Choose clone repository',
      properties: ['openDirectory'],
      defaultPath: osNode.homedir()
    }, (dir) => {
      let dirSafe = this.repo_dir.value;
      if (Array.isArray(dir) && !!dir[0]) {
        dirSafe = dir[0];
      }
      if (dirSafe) {
        this.repo_dir.setValue(dirSafe);
      }
    });
  }

  cancelAdding(isOutSide: boolean = false) {
    if (isOutSide) {
      this.closeStatus.emit({
        repository: null,
        cancel: true
      });
    }
  }

  formListener() {
    this.formRegisterRepository.valueChanges.subscribe(
      (formFields: any) => {
        console.log(formFields);
        this.checkingStepOneRepo(formFields);
      }
    );
  }

  checkingStepOneRepo(formField: { [key: string]: string }) {
    const dir = formField.repo_dir;
    let dirDisplay = dir;
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
}
