import { CommitOptions } from '../state/DATA/repository-branches';

export interface YesNoDialogModel<type = any> {
  title: string;
  body: string;
  data: type;
  decision: {
    yesText: string;
    noText?: string;

    additional?: {
      text: string,
      function: any
    }[];
  };
}

export const defaultCommitOptionDialog: YesNoDialogModel = {
  title: 'Commit Options',
  body: null,
  data: null,
  decision: {
    noText: 'Cancel',
    yesText: 'Apply'
  }
};

export interface CommitOptionsDialogs extends YesNoDialogModel {
  data: CommitOptions[];
}
