import { Injectable } from '@angular/core';
import * as git from 'simple-git/promise';
import { UtilityService } from '../../shared/utilities/utility.service';
import { Account } from '../../shared/states/DATA/account-list';
import { RepositoryBranchSummary } from '../../shared/states/DATA/repository-branches';
import { Repository, RepositoryRemotes } from '../../shared/states/DATA/repositories';
import { SecurityService } from '../system/security.service';
import * as moment from 'moment';
import { RemoteWithRefs } from 'simple-git/typings/response';
import { FileStatusSummaryView } from '../../shared/states/DATA/repository-status';

@Injectable()
export class GitService {

    constructor(
        private utilities: UtilityService,
        private securityService: SecurityService
    ) {
    }

    gitInstance(dir?: string) {
        dir = this.utilities.directorySafePath(dir);
        return git(dir);
    }

    async cloneTo(cloneURL: string, directory: string, credentials?: Account) {
        let urlRemote = cloneURL;
        directory = directory + this.utilities.repositoryNameFromHTTPS(cloneURL);
        if (credentials) {
            urlRemote = this.utilities.addCredentialsToRemote(cloneURL, credentials);
        }
        return git().clone(urlRemote, directory);
    }

    async allBranches(directory: string, credentials?: Account) {
        directory = this.utilities.directorySafePath(directory);
        const branchAll = await this.gitInstance(directory).branch(['-a']);
        const branchRemote = await this.gitInstance(directory).branch(['-r']);
        const branchMerged: RepositoryBranchSummary[] = [];

        Object.keys(branchRemote.branches).forEach(branchName => {
            const viewBranch: RepositoryBranchSummary = {
                id: this.securityService.randomID,
                ...branchRemote.branches[branchName],
                current: branchRemote.branches[branchName].current === 'true'
            };
            const arrSplitName = viewBranch.name.split('origin/');
            if (arrSplitName.length > 1 && arrSplitName[1] === branchAll.current) {
                Object.assign(viewBranch, { ...viewBranch }, { current: true });
            }
            branchMerged.push(viewBranch);
        });
        return branchMerged;
    }

    async getRemotes(repository: Repository) {
        return await this.gitInstance(repository.directory).getRemotes(true);
    }

    async updateRemotesRepository(repository: Repository, branches: RepositoryBranchSummary[]) {
        const remoteList: RemoteWithRefs[] = await this.getRemotes(repository);
        const updateRepository = { ...repository };
        const remoteRepositoryReturn: RepositoryRemotes[] = [];
        const remoteBranchesReturn: RepositoryBranchSummary[] = [];
        if (!this.isRemoteAvailable(repository)) {
            updateRepository.remote = [];
        }

        let activeBranchRetrieve = null;

        remoteList.forEach(remote => {
            const branchExisted = branches.find(branch => branch.name === remote.name);
            const id: string = !!branchExisted ? branchExisted.id : this.securityService.randomID;
            const newRemote = {
                id,
                name: remote.name,
                fetch: remote.refs.fetch,
                push: remote.refs.push,
            };
            remoteRepositoryReturn.push(newRemote);
            remoteBranchesReturn.push({
                id,
                commit: branchExisted ? branchExisted.commit : null,
                label: branchExisted ? branchExisted.label : null,
                name: branchExisted ? branchExisted.name : remote.name,
                current: branchExisted ? branchExisted.current : false
            });

            if (!!branchExisted && branchExisted.current) {
                activeBranchRetrieve = branchExisted.id;
            }
        });

        updateRepository.remote = remoteRepositoryReturn;
        return {
            repository: updateRepository,
            branches: remoteBranchesReturn,
            activeBranch: !!activeBranchRetrieve ? activeBranchRetrieve : remoteBranchesReturn[0].id,
        };
    }

    async fetchInfo(repository: Repository, credentials?: Account, customRemote: string = null) {
        // retrieve the directory for gitInstance to execute
        const { directory, remote } = repository;

        // checking remotes
        let urlRemotes: string = null;
        let fetchURlLocal: string = null;
        if (!!remote) {
            const findBranchDefault = remote.find(remoteFetch => remoteFetch.name === 'origin');
            if (!!findBranchDefault) {
                fetchURlLocal = findBranchDefault.fetch;
            }
        }
        if (!!remote && !!fetchURlLocal) {
            if (credentials) {
                urlRemotes = this.utilities.addCredentialsToRemote(fetchURlLocal, credentials);
            } else {
                urlRemotes = fetchURlLocal;
            }
        } else {
            // retrieve from gitInstance
            const listRemotes = await this.gitInstance(directory).getRemotes(true);
            let fallbackURLRemotes = '';
            const arrNewRemotes: RepositoryRemotes[] = [];

            listRemotes.forEach(remoteInfo => {
                if (!!!customRemote && remoteInfo.name === 'origin') {
                    urlRemotes = this.getURLRemoteFromListGitRemotes(remoteInfo, credentials);
                    fallbackURLRemotes = urlRemotes;
                } else if (remoteInfo.name === customRemote) {
                    urlRemotes = this.getURLRemoteFromListGitRemotes(remoteInfo, credentials);
                }

                arrNewRemotes.push({
                    id: this.securityService.randomID,
                    name: remoteInfo.name,
                    fetch: remoteInfo.refs.fetch,
                    push: remoteInfo.refs.push
                });
            });

            if (!urlRemotes && !fallbackURLRemotes) {
                return false;
            }

            if (!urlRemotes) {
                urlRemotes = fallbackURLRemotes;
            }

            repository.remote = arrNewRemotes;
        }
        // const urlRemote = this.utilities.addCredentialsToRemote(cloneURL, credentials);
        const data = await this.gitInstance(directory).fetch(urlRemotes);
        return {
            fetchData: data,
            repository
        };
    }

    async getStatusOnBranch(repository: Repository) {
        return this.gitInstance(repository.directory).status();
    }

    async isGitProject(directory: string) {
        directory = this.utilities.directorySafePath(directory);
        return await git(directory).checkIsRepo();
    }

    /**
     * TODO: checking git issue for more info.
     * @param repository
     * @param branchURL
     * @param credentials
     * @param options
     */
    push(repository: Repository, branchURL: string, credentials: Account, options?: { [o: string]: string }) {
        const urlRemote = this.utilities.addCredentialsToRemote(branchURL, credentials);
        // this.gitInstance(repository.directory).raw(
        //     [
        //         // `${urlRemote}`
        //         'push',
        //         `--repo=${ urlRemote }`,
        //         '--all'
        //     ]
        // ).then(r => console.log(r));
        return this.gitInstance(repository.directory).push().then(() => {
            console.log('push complete');
            return true;
        });
    }

    async commit(repository: Repository, message: string, fileList?: string[], option?: {
        [properties: string]: string
    }) {
        return this.gitInstance(repository.directory).commit(message, fileList, option);
    }

    async undoChange(repository: Repository, files: FileStatusSummaryView[]) {
        if (files.length === 0) {
            // reset hard
            return this.gitInstance(repository.directory).reset('hard');
        } else {
            const dirList = files.map(file => file.working_dir);
            return this.gitInstance(repository.directory)
            .checkout(dirList).then(() => null);
        }
    }

    async getDiffOfFile(repository: Repository, filePath: string) {
        return await this.gitInstance(repository.directory).diff(
            ['--', filePath]
        );
    }

    async addWatch(repository: Repository, fileDir: string[]) {
        return await this.gitInstance(repository.directory).add(fileDir);
    }

    async addStash(repository: Repository, message?: string) {
        if (!message) {
            message = `Stashed at ${ moment().format('YYYY/MM/DD - HH:mm:ss') }`;
        }
        return await this.gitInstance(repository.directory).stash();
    }

    async getListStash(repository: Repository) {
        return await this.gitInstance(repository.directory).stashList();
    }

    async getStash(repository: Repository) {
        return await this.gitInstance(repository.directory).stash([
            'pop'
        ]);
    }

    async switchBranch(repository: Repository, branch: RepositoryBranchSummary, credentials?: Account) {
        if (!this.isGitProject(repository.directory)) {
            return false;
        }

        return await this.gitInstance(repository.directory).checkout(branch.name)
        .then(resolve => true)
        .catch(err => {
            console.log(err);
            return false;
        });
    }

    isRemoteAvailable(repository: Repository) {
        return !!repository.remote;
    }

    isFetchRemoteAvailable(repository: Repository) {
        if (!this.isRemoteAvailable(repository)) {
            return false;
        }
        return !!repository.remote.find(any => any.fetch != null);
    }

    isPullRemoteAvailable(repository: Repository) {
        if (!this.isRemoteAvailable(repository)) {
            return false;
        }
        return !!repository.remote.find(any => any.push != null);
    }

    private getURLRemoteFromListGitRemotes(remoteInfo: {
        refs: {
            fetch: string;
            push: string;
        },
        [key: string]: any
    }, credentials?: Account) {
        if (credentials) {
            return this.utilities.addCredentialsToRemote(remoteInfo.refs.fetch, credentials);
        } else {
            return remoteInfo.refs.fetch;
        }
    }

}
