import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Account, AccountListQuery, AccountListState } from '../../states/DATA/account-list';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SecurityService } from '../../../services/system/security.service';

@Component({
    selector: 'gitme-credential-list',
    templateUrl: './credential-list.component.html',
    styleUrls: ['./credential-list.component.scss']
})
export class CredentialListComponent implements OnInit, AfterViewInit {

    @Input() accountSelected: AccountListState;
    @Output() accountSelectedChange = new EventEmitter();

    listExistedAccount: AccountListState[] = [];
    accountForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private accountListQuery: AccountListQuery,
        private securityService: SecurityService
    ) {
        this.accountListQuery.selectAll().subscribe(
            listExisted => {
                console.log(listExisted);
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
        const obEmit: Account = {
            username: valueSelected.username,
            password: this.securityService.encryptAES(valueSelected.password),
            password_raw: valueSelected.password_raw,
            id: valueSelected.id_local
        };
        console.log(this.accountForm.controls);
        this.accountSelectedChange.emit(obEmit);
    }
}
