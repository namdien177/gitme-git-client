import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Account, AccountListService } from '../../../state/DATA/account-list';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'gitme-credential-list',
  templateUrl: './credential-list.component.html',
  styleUrls: ['./credential-list.component.scss']
})
export class CredentialListComponent implements OnInit, AfterViewInit {

  @Output() accountSelectedChange: EventEmitter<Account> = new EventEmitter();

  listExistedAccount: Account[] = [];
  accountForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accountListQuery: AccountListService,
  ) {

  }

  get account() {
    return this.accountForm.get('account');
  }

  ngOnInit() {
    this.accountForm = this.fb.group({
      account: [null, [Validators.required]]
    });

    this.accountListQuery.getAsync()
    .subscribe(
      accounts => {
        this.listExistedAccount = accounts;
        if (!!accounts && Array.isArray(accounts) && !!this.account.value) {
          this.account.setValue(accounts[0]);
        }
      }
    );
  }

  ngAfterViewInit(): void {
    this.account.valueChanges.subscribe((val: Account) => {
      this.emitAccount(val);
    });
  }

  emitAccount(data: Account) {
    this.accountSelectedChange.emit(data);
  }
}
