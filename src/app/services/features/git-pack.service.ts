import { Injectable } from '@angular/core';
import * as git from 'simple-git/promise';
import { UtilityService } from '../../shared/utilities/utility.service';

@Injectable()
export class GitPackService {

  constructor(
    private utilities: UtilityService
  ) {
  }

  cloneTo(cloneURL: string, directory: string, credentials?: { username: string, password: string }) {
    let urlRemote = cloneURL;
    directory = directory + this.utilities.repositoryNameFromHTTPS(cloneURL);
    if (credentials) {
      urlRemote = this.utilities.addCredentialsToRemote(cloneURL, credentials);
    }
    return git().clone(urlRemote, directory);
  }
}
