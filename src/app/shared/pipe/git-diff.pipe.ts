import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gitDiff'
})
export class GitDiffPipe implements PipeTransform {

  transform(value: string, ...args: any[]): any {
    switch (value.charAt(0)) {
      case '+':
        return value.replace('+', ' ');
      case '-':
        return value.replace('-', ' ');
    }
    return value;
  }

}
