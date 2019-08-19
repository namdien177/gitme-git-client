import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'gitme-branch-item',
  templateUrl: './branch-item.component.html',
  styleUrls: ['./branch-item.component.scss']
})
export class BranchItemComponent implements OnInit {

  @Input() info;

  pullTitle = '4 Pull request';
  pushTitle = '4 Push request';
  changesTitle = '4 changes';

  constructor() {
  }

  ngOnInit() {
  }

}
