import { Component, Input, OnInit } from '@angular/core';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { GitService } from '../../../../services/features/core/git.service';
import { StatusSummary } from '../../../model/statusSummary.model';
import { fromPromise } from 'rxjs/internal-compatibility';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Account, AccountListService } from '../../../state/DATA/accounts';
import { of } from 'rxjs';
import { MatBottomSheet } from '@angular/material';
import { ContextMenuComponent } from '../_dialogs/context-menu/context-menu.component';

@Component({
  selector: 'gitme-repository-item',
  templateUrl: './repository-item.component.html',
  styleUrls: ['./repository-item.component.scss'],
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
    private bottomDialog: MatBottomSheet,
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
        switchMap(() => {
          return this.accountListService.getOneAsync(this.repository.id);
        }),
      ).subscribe(
      account => {
        this.account = account;
      },
    );

    this.repositoriesService.selectActive().pipe(
      distinctUntilChanged(),
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

  contextMenu() {
    const dataSheet = {
      repository: this.repository,
    };
    const optionRepo = this.bottomDialog.open(ContextMenuComponent, {
      panelClass: ['bg-primary-black', 'p-2-option'],
      data: dataSheet,
    });

    optionRepo.afterDismissed().subscribe(response => {
      console.log(response);
    });
  }
}
