import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Account, AccountListQuery } from '../../../states/DATA/account-list';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SecurityService } from '../../../../services/system/security.service';


@Component({
    selector: 'gitme-credential-input',
    templateUrl: './credential-input.component.html',
    styleUrls: ['./credential-input.component.scss']
})
export class CredentialInputComponent implements OnInit, AfterViewInit {

    @Input() account: Account;
    @Output() accountNewChange = new EventEmitter();

    @Output() isNewCredentialsValid = new EventEmitter();

    listMightMatchAccount: Account[] = [];

    accountForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private accountListQuery: AccountListQuery,
        private secureService: SecurityService
    ) {
        this.accountListQuery.selectAll().subscribe(
            listExisted => {
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

    get author() {
        return this.accountForm.get('author');
    }

    ngOnInit() {
        this.accountForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(3)]],
            uuid: ['', [Validators.required]],
            author: ['', [Validators.required]]
        });
    }

    ngAfterViewInit(): void {
        this.accountForm.valueChanges.subscribe(val => {
            this.onInputChanges();
        });
    }

    onInputChanges() {
        this.isNewCredentialsValid.emit(this.accountForm.valid);
        this.emitAccount();
    }

    emitAccount() {
        this.uuid.setValue(this.secureService.randomID, { emitEvent: false });
        if (this.author.pristine) {
            // Manually generate author name if it's empty
            if (this.username.valid) {
                this.author.setValue(
                    this.extractName(this.username.value),
                    { emitEvent: false }
                );
                this.author.markAsPristine();
            }
        }
        const obEmit: Account = {
            id: this.uuid.value,
            name_local: this.author.value,
            username: this.username.value,
            password: this.secureService.encryptAES(this.password.value)
        };
        this.accountNewChange.emit(obEmit);
    }

    private extractName(name: string) {
        return name.split('@')[0];
    }
}
