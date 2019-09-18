import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'gitDiff'
})
export class GitDiffPipe implements PipeTransform {

    transform(value: string, ...args: any[]): any {
        if (value.charAt(0) === '+' || value.charAt(0) === '-') {
            return ' ' + value.slice(1).trim();
        }
        return value;
    }

}
