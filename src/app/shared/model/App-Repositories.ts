import { Repository } from '../state/DATA/repositories';

export interface AppRepositories {
    repositories: Repository[];
}

export function InitializeRepositoryConfig() {
    return {
        repositories: []
    };
}
