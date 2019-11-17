import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { electronNode, osNode } from '../../../shared/types/types.electron';
import { UtilityService } from '../../../shared/utilities/utility.service';
import { RepositoriesMenuService } from '../../../shared/state/UI/repositories-menu';
import { GitService } from '../../../services/features/git.service';
import { FileSystemService } from '../../../services/system/fileSystem.service';
import { Router } from '@angular/router';
import { DialogsInformation } from '../../../shared/model/DialogsInformation';
import { isTypeAccount } from '../../../shared/validate/customFormValidate';
import { Account } from '../../../shared/state/DATA/account-list';

@Component({
  selector: 'gitme-import-https',
  templateUrl: './import-https.component.html',
  styleUrls: ['./import-https.component.scss']
})
export class ImportHttpsComponent implements OnInit, AfterViewInit {

  formRegisterRepository: FormGroup;
  directoryVerified = false;
  illuminateValue_dir: string = osNode.homedir();
  isExistingAccount = true;

  infoDialogs: DialogsInformation = {
    type: null,
    message: null
  };

  private readonly electron: typeof electronNode.remote;
  private formFieldBuilder = {
    repo_https: ['', [Validators.required, Validators.minLength(6)]],
    repo_dir: [osNode.homedir(), [Validators.required, Validators.minLength(1)]],
    repo_dir_display: [osNode.homedir(), [Validators.required, Validators.minLength(1)]],
    repo_name: ['', [Validators.required, Validators.minLength(1)]],
    repo_account: ['', [Validators.required, isTypeAccount]]
  };

  constructor(
    private formBuilder: FormBuilder,
    private utilityService: UtilityService,
    private repositoriesMenuService: RepositoriesMenuService,
    private gitPackService: GitService,
    private fileSystemService: FileSystemService,
    private cd: ChangeDetectorRef,
    private router: Router
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

  accountListener(account: Account) {
    this.repo_account.setValue(account);
  }

  cancelAdding() {
    this.router.navigateByUrl('/');
  }

  formListener() {
    this.formRegisterRepository.valueChanges.subscribe(
      (formFields: any) => {
        this.formValueListener(formFields);
      }
    );
  }

  formValueListener(formField: { [key: string]: string }) {
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
      const slided = this.utilityService.slashFixer(dirDisplay).split('/');
      this.cd.detectChanges();
    }
  }

  retrieveNameRepository(name: string) {
    if (!!name && name.length > 0) {
      this.repo_name.setValue(name);
    } else {
      this.repo_name.setValue(null);
    }
  }

  clone() {

  }

  test() {

  }

}
