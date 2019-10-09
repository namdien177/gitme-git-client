export interface YesNoDialogModel {
    title: string;
    body: string;
    data: any;
    decision: {
        yesText: string;
        noText: string
    };
}
