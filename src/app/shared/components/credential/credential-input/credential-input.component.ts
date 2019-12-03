import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Account } from '../../../state/DATA/accounts';
import { SecurityService } from '../../../../services/system/security.service';
import { GithubApiService } from '../../../../services/features/github-api.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
  selector: 'gitme-credential-input',
  templateUrl: './credential-input.component.html',
  styleUrls: ['./credential-input.component.scss']
})
export class CredentialInputComponent {

  @Output() accountNewChange = new EventEmitter();
  @Output() isNewCredentialsValid = new EventEmitter();

  @Input()
  account: Account = null;

  constructor(
    private secureService: SecurityService,
    private githubService: GithubApiService
  ) {

  }

  openAuthorize() {
    const token = this.githubService.requestAuthorizeGitHub();
    if (token) {
      this.requestUserInfo(token);
    } else {
      this.account = null;
      this.emitData();
    }
  }

  emitData() {
    this.accountNewChange.emit(this.account);
    this.isNewCredentialsValid.emit(!!this.account);
  }

  reAccount() {
    const token = this.githubService.requestAuthorizeGitHub();
    if (token) {
      this.requestUserInfo(token);
    }
    // Else keep the current account active
  }

  requestUserInfo(token: string) {
    console.log(token);
    this.githubService.getUser(token)
    .pipe(
      map(rawInfo => {
        console.log(rawInfo);
        // Encrypt the token
        rawInfo.oauth_token = this.secureService.encryptAES(token);
        console.log(rawInfo);
        return rawInfo;
      }),
      catchError(err => {
        return of(null);
      })
    )
    .subscribe(account => {
        console.log(account);
        this.account = account;
        this.emitData();
      }
    );
  }
}
