import { Component, Input, OnInit } from '@angular/core';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { GitService } from '../../../../services/features/git.service';
import { StatusSummary } from '../../../model/statusSummary.model';
import { fromPromise } from 'rxjs/internal-compatibility';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Account, AccountListService } from '../../../state/DATA/accounts';
import { of } from 'rxjs';

@Component({
  selector: 'gitme-repository-item',
  templateUrl: './repository-item.component.html',
  styleUrls: ['./repository-item.component.scss']
})
export class RepositoryItemComponent implements OnInit {

  @Input() repository: Repository;
  repositorySummary: StatusSummary = null;
  account: Account = null;

  isActive = false;

  pullTitle = ' Pull request';
  pushTitle = ' Push request';
  changesTitle = ' File changes';

  constructor(
    private gitService: GitService,
    private accountListService: AccountListService,
    private repositoriesService: RepositoriesService,
  ) {
  }

  ngOnInit() {
    this.retrieveFetchStatusRepository()
    .pipe(
      switchMap(summary => {
        this.repositorySummary = summary;
        return of(this.repositoriesService.getActive());
      }),
      distinctUntilChanged(),
      switchMap(activeRepository => {
        return this.accountListService.getOneAsync(this.repository.id);
      })
    ).subscribe(
      account => {
        this.account = account;
      }
    );

    this.repositoriesService.selectActive(false).pipe(
      distinctUntilChanged()
    ).subscribe(activeRepository => {
      this.isActive = activeRepository.id === this.repository.id;
    });
  }

  retrieveFetchStatusRepository() {
    return fromPromise(this.gitService.gitInstance(this.repository.directory).status());
  }

  switchToRepository() {
    this.repositoriesService.setActive(this.repository);
  }
}
