import { Injectable } from '@angular/core';
import { Account } from '../states/DATA/account-list';
import { SecurityService } from '../../services/system/security.service';
import { FileStatusSummaryView } from '../states/DATA/repository-status';
import { FileStatusSummary } from '../model/FileStatusSummary';


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
        private securityService: SecurityService
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
        const fixedRawPath = this.slashFixer(rawPath);
        const strSplit = fixedRawPath.split('/').map(nonTrim => nonTrim.trim());
        let finalDir = '';
        strSplit.forEach(arrDir => {
            if (arrDir.includes(' ')) {
                if (arrDir.indexOf('\'') === -1) {
                    finalDir += '\'' + arrDir + '\'';
                } else {
                    if (arrDir.indexOf('\'') === 0) {
                        finalDir += '\'' + arrDir;
                    } else if (arrDir.charAt(arrDir.length - 1) !== '\'') {
                        finalDir += arrDir + '\'';
                    }
                }
            } else {
                finalDir += arrDir;
            }
            finalDir += '/';
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

    addCredentialsToRemote(remoteURL: string, credentials: Account, isHTTPS: boolean = true) {
        if (isHTTPS) {
            const splitStr = remoteURL.split('//');
            const userSafe = this.gitStringSafe(credentials.username);
            const pwdSafe = this.gitStringSafe(this.securityService.decryptAES(credentials.password));
            let remoteCredentials = '';
            splitStr.forEach((stringRemote, index) => {
                remoteCredentials += stringRemote;
                if (index !== splitStr.length - 1) {
                    remoteCredentials += '//';
                }
                if (index === 0) {
                    remoteCredentials += userSafe + ':' + pwdSafe + '@';
                }
            });
            return remoteCredentials;
        }
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
        const dir = directory.split('/');
        let frontPath = '';
        dir.forEach((path, index) => {
            if (index !== dir.length - 1) {
                frontPath += path + '/';
            }
        });
        return {
            front: frontPath,
            end: dir[dir.length - 1]
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
                arrCompleted.push(safePath.slice(0, safePath.length - 1));
            }
        });
        return arrCompleted;
    }

    extractPathsFromRenamedCase(file: FileStatusSummaryView | FileStatusSummary) {
        const splitPaths = file.path.split('->');
        const deleted = this.directorySafePath(splitPaths[0].trim());
        const added = this.directorySafePath(splitPaths[1].trim());
        return {
            deleted: deleted.slice(0, deleted.length - 1),
            added: added.slice(0, added.length - 1)
        };
    }
}
