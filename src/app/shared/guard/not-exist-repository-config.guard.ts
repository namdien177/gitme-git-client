import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { switchMap } from 'rxjs/operators';
import { DataService } from '../../services/features/data.service';
import { SecurityService } from '../../services/system/security.service';
import { FileSystemService } from '../../services/system/fileSystem.service';

@Injectable({
  providedIn: 'root'
})
export class NotExistRepositoryConfigGuard implements CanActivateChild {
  constructor(
    private dataService: DataService,
    private securityService: SecurityService,
    private fileService: FileSystemService,
    private router: Router
  ) {

  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return fromPromise(
      this.dataService.getConfigAppData(this.securityService.appUUID)
    ).pipe(
      switchMap(appConfig => {
        if (appConfig && appConfig.repository_config.length > 0) {
          this.router.navigate(['/']);
          return of(false);
        }

        return of(true);
      })
    );
  }
}
