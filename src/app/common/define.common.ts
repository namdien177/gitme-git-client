import { electronNode } from '../shared/types/types.electron';

export class DefineCommon {
  static ROOT = electronNode.remote.app.getPath('userData');

  static ELECTRON_APPS_UUID_KEYNAME = 'uuid-electron-sc';
  static APP_VERSION = '0.1.6';
  static DIR_USERS = '/users';
  static DIR_REPOS = '/repositories';
  static CACHED_WORKING_REPO = 'cached-working-repo';


  static DIR_CONFIG(app_id?) {
    if (app_id !== undefined) {
      return '/app-config/' + app_id + '.json';
    }
    return '/app-config/';
  }

  static DIR_ACCOUNTS(app_id?) {
    if (app_id !== undefined) {
      return '/app-accounts/' + app_id + '.json';
    }
    return '/app-accounts/';
  }

  static DIR_REPOSITORIES(app_id?) {
    if (app_id !== undefined) {
      return '/app-repositories/' + app_id + '.json';
    }
    return '/app-repositories/';
  }
}
