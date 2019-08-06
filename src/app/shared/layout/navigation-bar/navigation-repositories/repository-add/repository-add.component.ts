import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RepositoryState } from '../../../../states/repository';
import { electronNG, nodePty, nodePtyTypeOf } from '../../../../types/types.electron';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'gitme-repository-add',
  templateUrl: './repository-add.component.html',
  styleUrls: ['./repository-add.component.scss']
})
export class RepositoryAddComponent implements OnInit {

  @Output() closeStatus: EventEmitter<{
    repository: RepositoryState,
    cancel: boolean
  }> = new EventEmitter<any>();

  formRegisterRepository: FormGroup;

  private readonly pty: nodePtyTypeOf;
  private readonly electron: typeof electronNG.remote; // must use remote to access render time

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.pty = nodePty;
    this.electron = electronNG.remote;
  }

  get repo_https() {
    return this.formRegisterRepository.get('repo_https');
  }

  get repo_dir() {
    return this.formRegisterRepository.get('repo_dir');
  }

  ngOnInit() {
    console.log(this.pty);
    console.log(this.electron.dialog);
    this.formRegisterRepository = this.formBuilder.group({
      repo_https: [''],
      repo_dir: ['']
    });
  }

  chooseDirectory() {
    this.electron.dialog.showOpenDialog(this.electron.getCurrentWindow(), {
      title: 'Choose clone repository',
      properties: ['openDirectory']
    }, (dir) => {
      console.log(dir);
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
}
