import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExistRepositoryConfigGuard } from './shared/guard/exist-repository-config.guard';
import { NotExistRepositoryConfigGuard } from './shared/guard/not-exist-repository-config.guard';

const routes: Routes = [
    {
        path: '',
        canActivate: [ExistRepositoryConfigGuard],
        loadChildren: () => import('./features/repositories/repositories.module').then(m => m.RepositoriesModule)
    },
    {
        path: 'application',
        canActivate: [NotExistRepositoryConfigGuard],
        loadChildren: () => import('./features/application/application.module').then(m => m.ApplicationModule)
    },
    {
        path: '**',
        redirectTo: '/application'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRouting {
}
