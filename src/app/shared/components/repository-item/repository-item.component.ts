import { Component, Input, OnInit } from '@angular/core';
import { Repository } from '../../states/repositories';
import { GitPackService } from '../../../services/features/git-pack.service';
import { SecurityService } from '../../../services/system/security.service';
import { FileSystemService } from '../../../services/system/fileSystem.service';
import { StatusSummary } from '../../model/StatusSummary';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'gitme-repository-item',
  templateUrl: './repository-item.component.html',
  styleUrls: ['./repository-item.component.scss']
})
export class RepositoryItemComponent implements OnInit {

  @Input() repository: Repository;
  repositoryObserve: Observable<StatusSummary>;

  pullTitle = '4 Pull request';
  pushTitle = '4 Push request';
  changesTitle = ' changes';

  constructor(
    private gitService: GitPackService,
    private securityService: SecurityService,
    private fileSystem: FileSystemService
  ) {
  }

  ngOnInit() {
    console.log(this.repository);
    this.gitService.isGitProject(this.repository.directory).then(
      status => {
        if (status) {
          return this.gitService.git(this.repository.directory)
          .status();
        } else {
          return Promise.reject('Not Git Repo');
        }
      }
    ).then(
      (resolve: StatusSummary) => {
        console.log(resolve);
        this.repositoryObserve = of(resolve);
      }
    );
  }
}
