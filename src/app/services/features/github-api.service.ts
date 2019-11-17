import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { electronNode } from '../../shared/types/types.electron';
import { BASE_API, USER_API } from '../../shared/model/GitHub/API';
import { HttpClient } from '@angular/common/http';
import { Account } from '../../shared/state/DATA/accounts';

@Injectable({
  providedIn: 'root'
})
export class GithubApiService {
  private ipcRenderer: typeof ipcRenderer;

  constructor(
    private http: HttpClient
  ) {
    this.ipcRenderer = electronNode.ipcRenderer;
  }

  getUser(oauthToken: string) {
    const header = this.constructHeader(oauthToken);
    const buildURL = BASE_API + USER_API;
    return this.http.get<Account>(buildURL, { headers: header });
  }

  requestAuthorizeGitHub() {
    const val: {
      credentials: string,
      crashErrorLogs: any,
    } = ipcRenderer.sendSync('github-authenticate', 'yes');
    return val.credentials;
  }

  private constructHeader(oauthToken: string) {
    return {
      Authorization: `token ${ oauthToken }`
    };
  }
}
