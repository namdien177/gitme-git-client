import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Account, AccountListQuery, AccountListState } from '../../states/account-list';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SecurityService } from '../../../services/system/security.service';


@Component({
  selector: 'gitme-credential-input',
  templateUrl: './credential-input.component.html',
  styleUrls: ['./credential-input.component.scss']
})
export class CredentialInputComponent implements OnInit, AfterViewInit {

  @Input() account: Account;
  @Output() accountChange = new EventEmitter();

  @Output() isCredentialsValid = new EventEmitter();

  listMightMatchAccount: Account[] = [];

  accountForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accountListQuery: AccountListQuery,
    private secureService: SecurityService
  ) {
    this.accountListQuery.selectAll().subscribe(
      listExisted => {
        console.log(listExisted);
        this.listMightMatchAccount = listExisted;
      }
    );
  }

  get uuid() {
    return this.accountForm.get('uuid');
  }

  get username() {
    return this.accountForm.get('username');
  }

  get password() {
    return this.accountForm.get('password');
  }

  ngOnInit() {
    this.accountForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      uuid: ['', [Validators.required]]
    });
  }

  ngAfterViewInit(): void {
    this.accountForm.valueChanges.subscribe(val => {
      this.onInputChanges();
    });
  }

  onInputChanges() {
    this.isCredentialsValid.emit(this.accountForm.valid);
    this.emitAccount();
  }

  emitAccount() {
    this.uuid.setValue(this.secureService.randomID, { emitEvent: false });
    const obEmit: Account = {
      username: this.username.value,
      password: this.secureService.encryptAES(this.password.value),
      password_raw: this.password.value,
      id: this.uuid.value
    };
    console.log(this.accountForm.controls);
    this.accountChange.emit(obEmit);
  }
}
