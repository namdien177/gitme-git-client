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
      account: Account
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
    const check = await this.git.checkRemote(this.data.branch.tracking.fetch, account);
    if (check) {
      this.isChecked = true;
    }
  }

  listenNewAccount(account: Account) {
    if (account) {
      this.newAccount = account;
    }
  }
}
