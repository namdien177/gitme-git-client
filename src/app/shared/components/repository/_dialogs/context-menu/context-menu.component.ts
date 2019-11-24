import { Component, Inject, OnInit } from '@angular/core';
import { Repository } from '../../../../state/DATA/repositories';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';

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
  ) {
  }

  ngOnInit() {
  }

}
