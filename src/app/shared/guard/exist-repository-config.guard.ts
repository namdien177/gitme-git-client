import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { DataService } from '../../services/features/data.service';
import { fromPromise } from 'rxjs/internal-compatibility';
import { SecurityService } from '../../services/system/security.service';
import { switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ExistRepositoryConfigGuard implements CanActivate {

    constructor(
        private dataService: DataService,
        private securityService: SecurityService,
        private router: Router
    ) {

    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return fromPromise(
            this.dataService.getRepositoriesFromFile(this.securityService.appUUID)
        ).pipe(
            switchMap(appRepo => {
                if (appRepo && appRepo.repositories.length > 0) {
                    return of(true);
                }

                this.router.navigate(['/application']);
                return of(false);
            })
        );
    }

}
