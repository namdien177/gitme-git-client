import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { switchMap } from 'rxjs/operators';
import { DataService } from '../../services/features/data.service';
import { SecurityService } from '../../services/system/security.service';

@Injectable({
    providedIn: 'root'
})
export class NotExistRepositoryConfigGuard implements CanActivate {
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
                console.log(appRepo);
                if (appRepo && appRepo.repositories.length > 0) {
                    this.router.navigate(['/']);
                    return of(false);
                }

                return of(true);
            })
        );
    }
}
