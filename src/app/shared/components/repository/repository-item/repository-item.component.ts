import { Component, Input, OnInit } from '@angular/core';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { GitService } from '../../../../services/features/git.service';
import { StatusSummary } from '../../../model/statusSummary.model';
import { fromPromise } from 'rxjs/internal-compatibility';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Account, AccountListService } from '../../../state/DATA/account-list';
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

    // const test: Repository = {
    //     id: 'cy8fcjzinl5yl',
    //     id_remote: null,
    //     name: 'gitme-git-client',
    //     directory: 'D:\\Projects\\School\\_topup\\GitMe\\gitme-git-client',
    //     credential: {
    //         id_credential: 'cybm0jzguzvjx',
    //         name: 'Onaya [P]'
    //     },
    //     selected: true
    // };
    //
    // const testCre: Account = {
    //     id: 'cybm0jzguzvjx',
    //     name_local: 'Onaya',
    //     avatar_local: 'https://nvzaqa.bn.files.1drv.com/y4mYLUEthiaB_9EF0AaRx5FMxDXEn6DgRuDp8xcmXydtg2hwIRSZnV7r57PCOKn5n48VEidRtpEs95WNxYE8QCHwfeIo_43qJI4o_I5DRcQikCL-f4dhHgQO0ouif7EszbmtZ9ubA44c-VjA9zU19rAa1Y8IY82rP5vPcSt1Cvf5HibKSFsXGBt1woCx_uHHTQPBHste6sCpFt1x9hH5UMuzA?width=281&height=179&cropmode=none',
    //     username: 'do.hoangnam9x@gmail.com',
    // };
    // this.gitService.fetchInfo(this.repository, this.account).then(
    //     res => {
    //         console.log(res);
    //         return this.gitService.allBranches('D:\\Projects\\School\\_topup\\GitMe\\gitme-git-client');
    //     }
    // ).then(
    //     resolve => {
    //         console.log(resolve);
    //     },
    //     reject => {
    //         console.log(reject);
    //     }
    // );

  }

  retrieveFetchStatusRepository() {
    return fromPromise(this.gitService.gitInstance(this.repository.directory).status());
  }

  switchToRepository() {
    this.repositoriesService.setActive(this.repository);
  }
}
