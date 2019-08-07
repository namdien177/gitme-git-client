import { Injectable } from '@angular/core';


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

  constructor() {
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

  gitStringSafe(dangerString: string) {
    const charLength = dangerString.length;
    let finalString = '';
    for (let i = 0; i < charLength; i++) {
      const viewingChar = dangerString.charAt(i);
      const safeStringFound = this.pairReplacementGitString.find(
        replace => replace.invalid === viewingChar
      );
      if (safeStringFound !== undefined) {
        finalString += safeStringFound.replace;
      } else {
        finalString += viewingChar;
      }
    }
    return finalString;
  }

  directorySafePath(rawPath: string) {
    const strSplit = rawPath.split('\\').map(nonTrim => nonTrim.trim());
    let finalDir = '';
    strSplit.forEach(arrDir => {
      if (arrDir.includes(' ')) {
        finalDir += '\'' + arrDir + '\'' + '\\';
      } else {
        finalDir += arrDir + '\\';
      }
    });
    return finalDir;
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
    const removeDotGit = nameWithDotGit.slice(0, nameWithDotGit.length - 4);
    console.log(strSplit);
    console.log(removeDotGit);
    return removeDotGit;
  }
}
