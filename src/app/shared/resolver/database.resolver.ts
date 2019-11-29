import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { ElectronService } from '../../services/system/electron.service';
import { fromPromise } from 'rxjs/internal-compatibility';

@Injectable()
export class DatabaseResolver implements Resolve<any> {
  constructor(
    private electronService: ElectronService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return fromPromise(this.electronService.initializeConfigFromLocalDatabase());
  }
}
