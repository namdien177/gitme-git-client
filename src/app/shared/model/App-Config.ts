import { Repository } from '../states/repositories';
import { Account } from '../states/account-list';

export class AppConfig {
  app_key: string;
  version: string;
  first_init: {
    created_at: number
    [key: string]: any;
  };
  repositories: Repository[];
  credentials: Account[];
}
