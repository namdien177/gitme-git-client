import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'gitme-repository-item',
  templateUrl: './repository-item.component.html',
  styleUrls: ['./repository-item.component.scss']
})
export class RepositoryItemComponent implements OnInit {

  @Input() info;

  pullTitle = '4 Pull request';
  pushTitle = '4 Push request';
  changesTitle = '4 changes';

  constructor() {
  }

  ngOnInit() {
  }
}
