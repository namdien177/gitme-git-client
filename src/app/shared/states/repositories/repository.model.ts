export interface Repository {
  id: string;
  id_remote?: string;
  name?: string;
  directory?: string;
  credential?: {
    id_credential: string;
    name?: string
  };
}
