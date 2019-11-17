import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepositoriesComponent } from './repositories.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RepoHistoryComponent } from './repo-history/repo-history.component';

const routes: Routes = [
  {
    path: '', component: RepositoriesComponent, children: [
      // { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '', pathMatch: 'full', component: DashboardComponent },
      { path: 'history', component: RepoHistoryComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepositoriesRouting {
}
