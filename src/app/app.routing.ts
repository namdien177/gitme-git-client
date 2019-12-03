import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExistRepositoryConfigGuard } from './shared/guard/exist-repository-config.guard';
import { NotExistRepositoryConfigGuard } from './shared/guard/not-exist-repository-config.guard';
import { ImportHttpsComponent } from './features/application/import-https/import-https.component';
import { ImportLocalComponent } from './features/application/import-local/import-local.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        canActivateChild: [ExistRepositoryConfigGuard],
        loadChildren: () => import('./features/repositories/repositories.module').then(m => m.RepositoriesModule),
      },
      {
        path: 'application',
        canActivateChild: [NotExistRepositoryConfigGuard],
        loadChildren: () => import('./features/application/application.module').then(m => m.ApplicationModule),
      },
      { path: 'application/import-https', component: ImportHttpsComponent },
      { path: 'application/import-local', component: ImportLocalComponent },
    ]
  },
  {
    path: '**',
    redirectTo: '/',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRouting {
}
