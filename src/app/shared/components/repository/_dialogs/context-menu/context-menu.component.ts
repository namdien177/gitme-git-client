import { Component, Inject, OnInit } from '@angular/core';
import { Repository } from '../../../../state/DATA/repositories';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';
import { FileSystemService } from '../../../../../services/system/fileSystem.service';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class ContextMenuComponent implements OnInit {

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ContextMenuComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
      repository: Repository
    },
    private fileSystem: FileSystemService,
  ) {
  }

  ngOnInit() {
  }

  openFolder() {
    this.fileSystem.openFolderOf(this.data.repository.directory);
    this._bottomSheetRef.dismiss();
  }

  removeFromDataBase() {

  }
}
