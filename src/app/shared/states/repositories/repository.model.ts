export interface Repository {
  id?: number;
  id_local?: number;
  name?: string;
  directory?: string;
}

export function createRepository(params: Partial<Repository>) {
  return {} as Repository;
}
