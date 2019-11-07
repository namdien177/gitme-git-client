import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'recentTime',
})
export class RecentTimeDirective implements PipeTransform {

  transform(value: number, ...args: any[]): any {
    const momentObject = moment.utc(value);
    return momentObject.fromNow();
  }
}

