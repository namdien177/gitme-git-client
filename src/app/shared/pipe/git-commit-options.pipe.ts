import { Pipe, PipeTransform } from '@angular/core';
import { CommitOptions } from '../state/DATA/branches';
import { UtilityService } from '../utilities/utility.service';

@Pipe({
  name: 'gitCommitOptions'
})
export class GitCommitOptionsPipe implements PipeTransform {

  constructor(private utilitiesService: UtilityService) {
  }

  transform(value: CommitOptions, ...args: any[]): any {
    if (!!value) {
      return this.utilitiesService.stringifyObjectOption(value);
    }
    return 'none';
  }

}
