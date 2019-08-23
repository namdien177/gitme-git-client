export class StatusSummary {
    ahead: number;
    behind: number;
    conflicted: any[];
    created: string[];
    current: string;
    deleted: any[];
    files: any[]; // file status summary
    modified: string[];
    not_added: string[];
    renamed: any[];
    staged: any[];
    tracking: string;
}
