export class AppConfig {
    app_key: string;
    version: string;
    first_init: {
        created_at: number
        [key: string]: any;
    };
    repository_config: string[];
    account_config: string[];
}
