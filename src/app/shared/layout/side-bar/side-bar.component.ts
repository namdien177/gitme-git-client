import { Component, OnInit } from '@angular/core';
import { RepositoriesMenuQuery } from '../../states/repositories-menu';

@Component({
  selector: 'gitme-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {

  // repositories: Observable<RepositoriesState>;

  constructor(
    // private repositoryQuery: RepositoriesQuery
    private repoMenu: RepositoriesMenuQuery
  ) {
  }

  ngOnInit() {
    this.repoMenu.select().subscribe(e => {
      console.log(e);
    });
  }

}
