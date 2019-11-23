import { Injectable } from '@angular/core';
import { SecurityService } from '../../services/system/security.service';
import { FileStatusSummaryView } from '../state/DATA/repository-status';
import { FileStatusSummary } from '../model/FileStatusSummary';
import { CommitOptions, RepositoryBranchSummary } from '../state/DATA/branches';
import { Account } from '../state/DATA/accounts';
import { Repository } from '../state/DATA/repositories';
import * as child_process from 'child_process';

@Injectable()
export class UtilityService {

  private pairReplacementGitString = [
    { invalid: '!', replace: '%21' },
    { invalid: '#', replace: '%23' },
    { invalid: '$', replace: '%24' },
    { invalid: '&', replace: '%26' },
    { invalid: '\'', replace: '%27' },
    { invalid: '(', replace: '%28' },
    { invalid: ')', replace: '%29' },
    { invalid: '*', replace: '%2A' },
    { invalid: '+', replace: '%2B' },
    { invalid: ',', replace: '%2C' },
    { invalid: '/', replace: '%2F' },
    { invalid: ':', replace: '%3A' },
    { invalid: ';', replace: '%3B' },
    { invalid: '=', replace: '%3D' },
    { invalid: '?', replace: '%3F' },
    { invalid: '@', replace: '%40' },
    { invalid: '[', replace: '%5B' },
    { invalid: ']', replace: '%5D' },
  ];

  constructor(
    private securityService: SecurityService,
  ) {
  }

  static htmlUnitToFixed(strUnit: string): number {
    if (!isNaN(+strUnit)) {
      return null;
    }
    if (strUnit.includes('px') ||   // for px
      strUnit.includes('e') ||    // for em, ex
      strUnit.includes('v') ||    // for vw, vh
      strUnit.includes('r') ||    // for rem
      strUnit.includes('c')       // for ch
    ) {
      return +strUnit.substr(0, strUnit.length - 2);
    }

    return +strUnit.substr(0, strUnit.length - 1);
  }

  /**
   * Get the string that parsed all unicode characters to safe characters to include in terminal git command
   * @param dangerString
   */
  gitStringSafe(dangerString: string) {
    const charLength = dangerString.length;
    let finalString = '';
    for (let i = 0; i < charLength; i++) {
      const viewingChar = dangerString.charAt(i);
      const safeStringFound = this.pairReplacementGitString.find(
        replace => replace.invalid === viewingChar,
      );
      if (safeStringFound !== undefined) {
        finalString += safeStringFound.replace;
      } else {
        finalString += viewingChar;
      }
    }
    return finalString;
  }

  repositoryNameFromHTTPS(rawHTTP: string) {
    if (!rawHTTP.match(/^((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:\/\-~]+)(\.git)$/)) {
      return false;
    }
    const strSplit = rawHTTP.split('/');
    const nameWithDotGit = strSplit[strSplit.length - 1];
    if (nameWithDotGit.slice(nameWithDotGit.length - 4) !== '.git') {
      return false;
    }
    return nameWithDotGit.slice(0, nameWithDotGit.length - 4);
  }

  addOauthTokenToRemote(remoteURL: string, credential: Account, isHTTPS: boolean = true) {
    const { login, oauth_token } = credential;
    const tokenDecrypted = this.gitStringSafe(this.securityService.decryptAES(oauth_token));
    const appendedToken = login + ':' + tokenDecrypted + '@';
    const regexCheck = new RegExp(`^https://${appendedToken}\\w+`);
    const regexCheckOld = new RegExp(`^https://.{${appendedToken.length},}\\w+`);
    if (isHTTPS) {
      if (remoteURL.match(regexCheck)) {
        // Already included with token
        return remoteURL;
      } else if (remoteURL.match(regexCheckOld)) {
        // // replace with wrong credential
        // This must be checked more carefully
        // return remoteURL.replace(new RegExp(`^https://.{${appendedToken.length},}`), `https://${appendedToken}@`);
      }
      return remoteURL.replace(/^https:\/\//, `https://${appendedToken}`);
    }
  }

  getOAuthRemote(branch: RepositoryBranchSummary, repository: Repository, credentials: Account, mode: 'fetch' | 'push') {
    let remote, OAuthRemote;
    if (!branch.tracking) {
      try {
        remote = repository.branches.find(b => b.name === 'master').tracking[mode];
        OAuthRemote = this.addOauthTokenToRemote(remote, credentials);
      } catch (e) {
        console.log(e);
        OAuthRemote = 'origin';
      }
    } else {
      remote = branch.tracking[mode];
      OAuthRemote = this.addOauthTokenToRemote(remote, credentials);
    }
    return OAuthRemote;
  }

  /**
   * Retrieve the safe directory string to use in terminal
   * @param rawPath
   */
  directorySafePath(rawPath: string) {
    const fixedRawPath = this.slashFixer(rawPath);
    return decodeURIComponent(fixedRawPath);
  }

  isStringExistIn(stringToCheck: string, inWhatArray: any[], propertiesInArray?: string) {
    let isIn = false;
    inWhatArray.every(toCompare => {
      const checkingData = propertiesInArray ? toCompare[propertiesInArray] : toCompare;
      if (checkingData === stringToCheck) {
        isIn = true;
        return false;
      }
      return true;
    });
    return isIn;
  }

  /**
   * Convert all `\` character to `/`
   * @param directory
   */
  slashFixer(directory: string) {
    return directory.replace(/\\/g, '/');
  }

  extractFrontPath(directory: string) {
    directory = this.slashFixer(directory);
    const dir = directory.split('/');
    let frontPath = '';
    dir.forEach((path, index) => {
      if (index !== dir.length - 1) {
        frontPath += path + '/';
      }
    });
    return {
      front: frontPath,
      end: dir[dir.length - 1],
    };
  }

  extractFilePathFromGitStatus(files: FileStatusSummaryView[] | FileStatusSummary[]) {
    const arrCompleted: string[] = [];
    files.forEach(file => {
      if (file.path.includes('->')) {
        const extracted = this.extractPathsFromRenamedCase(file);
        arrCompleted.push(extracted.deleted, extracted.added);
      } else {
        const safePath = this.directorySafePath(file.path);
        arrCompleted.push(safePath);
      }
    });
    return arrCompleted;
  }

  extractPathsFromRenamedCase(file: FileStatusSummaryView | FileStatusSummary) {
    const splitPaths = file.path.split('->');
    const deleted = this.directorySafePath(splitPaths[0].trim());
    const added = this.directorySafePath(splitPaths[1].trim());
    return {
      deleted: deleted,
      added: added,
    };
  }

  stringifyObjectOption(objOptions: CommitOptions) {
    let stringFinal = '';
    Object.keys(objOptions).forEach(argu => {
      stringFinal += argu + (argu.trim().indexOf('--') === 0 ? '=' : ' ');
      // appending value
      stringFinal += (!!objOptions[argu] ? objOptions[argu].trim() : '') + ' ';
    });
    return stringFinal.length > 0 ? stringFinal : 'none';
  }

  execScript(dataExecute: { command: string, directory: string }, callback) {
    const { command, directory } = dataExecute;
    const child = child_process.spawn(command, undefined, {
      shell: true, cwd: directory,
    });
    let dataEnd = '';
    // You can also use a variable to save the output for when the script closes later
    child.on('error', (error) => {
      console.log(error);
    });

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
      // Here is the output
      data = data.toString();
      dataEnd = data;
    });

    child.stderr.setEncoding('utf8');
    child.on('close', (code) => {
      // Here you can get the exit code of the script
      switch (code) {
        case 0:
          console.log('end');
          break;
      }
      callback(dataEnd);
    });
  }
}
