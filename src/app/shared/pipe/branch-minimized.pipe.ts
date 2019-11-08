import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'branchNameShorten'
})
export class BranchMinimizedPipe implements PipeTransform {

  transform(value: string, ...args: any[]): any {
    if (value.indexOf('origin/') === 0) {
      const indexFirstSlash = value.indexOf('/');
      return value.slice(indexFirstSlash + 1);
    }
    return value;
  }
}
