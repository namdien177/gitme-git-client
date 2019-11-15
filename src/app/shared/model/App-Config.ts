import { DefineCommon } from '../../common/define.common';
import * as moment from 'moment';

export interface AppConfig {
  app_key: string;
  version: string;
  first_init: {
    created_at: number
    [key: string]: any;
  };
  /**
   * ID of the repository config json file
   */
  repository_config: string[];
  /**
   * ID of the account config json file
   */
  account_config: number[];
}

export function InitializeAppConfig(machineID: string) {
  return {
    app_key: machineID,
    version: DefineCommon.APP_VERSION,
    first_init: {
      created_at: moment().valueOf()
    },
    repository_config: [],
    account_config: []
  } as AppConfig;
}

export function isValidAppConfig(config: AppConfig) {
  let isValid = true;
  Object.keys(config).every(
    prop => {
      if (config[prop] == null || config[prop] === undefined) {
        isValid = false;
        return false;
      }
      return true;
    }
  );
  return isValid ? config : false;
}
