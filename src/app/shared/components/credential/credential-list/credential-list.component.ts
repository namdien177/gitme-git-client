import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Account, AccountListQuery, AccountListState } from '../../../state/DATA/account-list';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'gitme-credential-list',
  templateUrl: './credential-list.component.html',
  styleUrls: ['./credential-list.component.scss']
})
export class CredentialListComponent implements OnInit, AfterViewInit {

  @Output() accountSelectedChange: EventEmitter<Account> = new EventEmitter();
  @Output() isExistingCredentialValid: EventEmitter<boolean> = new EventEmitter();

  listExistedAccount: AccountListState[] = [];
  accountForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accountListQuery: AccountListQuery,
  ) {
    this.accountListQuery.selectAll().subscribe(
      listExisted => {
        this.listExistedAccount = listExisted;
      }
    );
  }

  get account() {
    return this.accountForm.get('account');
  }

  ngOnInit() {
    this.accountForm = this.fb.group({
      account: [null, [Validators.required]]
    });

    this.emitAccount();
  }

  ngAfterViewInit(): void {
    this.accountForm.valueChanges.subscribe(val => {
      this.onCheckboxChanges();
    });
  }

  onCheckboxChanges() {
    this.emitAccount();
  }

  emitAccount() {
    const valueSelected: Account = this.account.value;
    this.accountSelectedChange.emit(valueSelected);
    this.isExistingCredentialValid.emit(this.accountForm.valid);
  }
}
