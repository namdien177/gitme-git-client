export interface Repository {
    id: string;
    id_remote?: string;
    name?: string;
    name_local?: string;
    directory?: string;
    credential?: {
        id_credential: string;
        name?: string
    };
    selected: boolean;
    remote?: {
        fetch: string;
        pull: string;
    };

    [key: string]: any;
}
