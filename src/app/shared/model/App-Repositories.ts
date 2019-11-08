import { Repository } from '../state/DATA/repositories';

export interface AppRepositories {
  repository: Repository;
}

export function InitializeRepositoryConfig(repository: Repository) {
  return {
    repository: repository
  } as AppRepositories;
}
