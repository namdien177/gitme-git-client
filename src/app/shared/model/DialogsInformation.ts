export interface DialogsInformation {
    type: 'ERROR' | 'INFO' | 'WARNING';
    message: string;

    [key: string]: any;
}
