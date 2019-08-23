import { Component, Input, OnInit } from '@angular/core';
import { Repository } from '../../states/DATA/repositories';
import { GitService } from '../../../services/features/git.service';
import { SecurityService } from '../../../services/system/security.service';
import { FileSystemService } from '../../../services/system/fileSystem.service';
import { StatusSummary } from '../../model/StatusSummary';
import { Observable, of } from 'rxjs';
import { Account } from '../../states/DATA/account-list';

@Component({
    selector: 'gitme-repository-item',
    templateUrl: './repository-item.component.html',
    styleUrls: ['./repository-item.component.scss']
})
export class RepositoryItemComponent implements OnInit {

    @Input() repository: Repository;
    repositoryObserve: Observable<StatusSummary>;

    pullTitle = ' Pull request';
    pushTitle = ' Push request';
    changesTitle = ' File changes';

    constructor(
        private gitService: GitService,
        private securityService: SecurityService,
        private fileSystem: FileSystemService
    ) {
    }

    ngOnInit() {
        this.gitService.isGitProject(this.repository.directory).then(
            status => {
                if (status) {
                    return this.gitService.git(this.repository.directory).status();
                } else {
                    return Promise.reject('Not Git Repo');
                }
            }
        ).then(
            (resolve: StatusSummary) => {
                console.log(resolve);
                this.repositoryObserve = of(resolve);
            }
        ).catch(err => console.log(err));
        const test: Repository = {
            id: 'cy8fcjzinl5yl',
            id_remote: null,
            name: 'gitme-git-client',
            directory: 'D:\\Projects\\School\\_topup\\GitMe\\gitme-git-client',
            credential: {
                id_credential: 'cybm0jzguzvjx',
                name: 'Onaya [P]'
            },
            selected: true
        };

        const testCre: Account = {
            id: 'cybm0jzguzvjx',
            name_local: 'Onaya',
            avatar_local: 'https://nvzaqa.bn.files.1drv.com/y4mYLUEthiaB_9EF0AaRx5FMxDXEn6DgRuDp8xcmXydtg2hwIRSZnV7r57PCOKn5n48VEidRtpEs95WNxYE8QCHwfeIo_43qJI4o_I5DRcQikCL-f4dhHgQO0ouif7EszbmtZ9ubA44c-VjA9zU19rAa1Y8IY82rP5vPcSt1Cvf5HibKSFsXGBt1woCx_uHHTQPBHste6sCpFt1x9hH5UMuzA?width=281&height=179&cropmode=none',
            username: 'do.hoangnam9x@gmail.com',
            password: '1666bc43be92c738d7a3b6a094b8cabc:294308e8d8f36b0b3cf53f4a7c8f821e'
        };
        this.gitService.fetchInfo(test, testCre).then(
            res => {
                console.log(res);
                return this.gitService.allBranches('D:\\Projects\\School\\_topup\\GitMe\\gitme-git-client');
            }
        ).then(
            resolve => {
                console.log(resolve);
            },
            reject => {
                console.log(reject);
            }
        );

    }
}
