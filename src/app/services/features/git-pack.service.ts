import { Injectable } from '@angular/core';
import * as git from 'simple-git/promise';
import { UtilityService } from '../../shared/utilities/utility.service';
import { AccountList } from '../../shared/states/account-list';

@Injectable()
export class GitPackService {

  constructor(
    private utilities: UtilityService
  ) {
  }

  cloneTo(cloneURL: string, directory: string, credentials?: AccountList) {
    let urlRemote = cloneURL;
    directory = directory + this.utilities.repositoryNameFromHTTPS(cloneURL);
    if (credentials) {
      urlRemote = this.utilities.addCredentialsToRemote(cloneURL, credentials);
    }
    return git().clone(urlRemote, directory);
  }

  allBranches(directory: string, credentials?: { username: string, password: string }) {
    directory = this.utilities.directorySafePath(directory);
    console.log(directory);
    // return git(directory).fetch(
    //   'https://do.hoangnam9x%40gmail.com:CA8Z2joN4MEu@gitlab.com/manhjin/acomici.com.git'
    // );
    return git(directory).pull('origin', '', ['https://do.hoangnam9x%40gmail.com:CA8Z2joN4MEu@gitlab.com/manhjin/acomici.com.git']).then(resolve => {
      console.log(resolve);
      return git(directory).branch(['-r']);
    }, reject => {
      console.log(reject);
    });
  }
}
