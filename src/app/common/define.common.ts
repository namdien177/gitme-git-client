import { electronNG } from '../shared/types/types.electron';

export class DefineCommon {
    static ROOT = electronNG.remote.app.getPath('userData');

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
}
