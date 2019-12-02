import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Repository } from '../../../../state/DATA/repositories';
import { RepositoryBranchSummary } from '../../../../state/DATA/branches';
import { Account } from '../../../../state/DATA/accounts';
import { GitService } from '../../../../../services/features/core/git.service';

@Component({
  selector: 'gitme-unauthorize-dialog',
  templateUrl: './un-authorized-dialog.component.html',
  styleUrls: ['./un-authorized-dialog.component.scss']
})
export class UnAuthorizedDialogComponent implements OnInit {

  newAccount: Account = null;
  isChecked = false;

  constructor(
    private matDialogRef: MatDialogRef<UnAuthorizedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      repository: Repository,
      branch: RepositoryBranchSummary,
      account: Account,
      mode: 'push' | 'fetch'
    },
    private git: GitService
  ) {
  }

  ngOnInit() {
  }

  async checkRemote() {
    this.isChecked = false;
    if (!this.newAccount && !this.data.account) {
      return;
    }

    const account = !!this.newAccount ? this.newAccount : this.data.account;
    let remote = null;
    if (!this.data.branch.tracking || !this.data.branch.tracking[this.data.mode]) {
      remote = this.data.repository.branches.find(b => b.name === 'master').tracking[this.data.mode];
    } else {
      remote = this.data.branch.tracking[this.data.mode];
    }
    if (!remote) {
      this.isChecked = false;
      return;
    }
    const check = await this.git.checkRemote(remote, account);
    if (check) {
      this.isChecked = true;
    }
  }

  listenNewAccount(account: Account) {
    this.isChecked = false;
    if (account) {
      this.newAccount = account;
    }
  }
}
