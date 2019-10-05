import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isAccountType } from '../state/DATA/account-list';

/**
 * Check if length of the array larger than the specified length.
 * The comparison is array *>* length
 * @param length
 */
export function ArrayLengthShouldLargerThan(length: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!Array.isArray(control.value)) {
            return {
                type: 'The value was not array'
            };
        }
        const validateArray = control.value.length > length;
        return validateArray ? null : { length: `The array length was sorter or equal ${ length }` };
    };
}

export function isTypeAccount(account: object): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!account || !isAccountType(account)) {
            return {
                type: 'The value was not array'
            };
        }
        return null;
    };
}
