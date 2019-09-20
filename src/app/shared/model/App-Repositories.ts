import { Repository } from '../states/DATA/repositories';

export interface AppRepositories {
    repositories: Repository[];
}

export function InitializeRepositoryConfig() {
    return {
        repositories: []
    };
}
