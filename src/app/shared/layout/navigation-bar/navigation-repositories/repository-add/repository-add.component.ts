import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RepositoryState } from '../../../../states/repository';
import { electronNG, electronNGTypeOf, nodePty, nodePtyTypeOf } from '../../../../types/types.electron';

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

  private readonly pty: nodePtyTypeOf;
  private readonly electron: electronNGTypeOf;

  constructor() {
    this.pty = nodePty;
    this.electron = electronNG;
  }

  ngOnInit() {
    console.log(this.pty);
    console.log(this.electron);
  }

  chooseDirectory() {
    this.electron.dialog.showOpenDialog({
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
