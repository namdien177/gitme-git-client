import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { ImportHttpsComponent } from './import-https/import-https.component';
import { ImportLocalComponent } from './import-local/import-local.component';
import { ApplicationComponent } from './application.component';

const routes: Routes = [
  {
    path: '', component: ApplicationComponent, children: [
      { path: '', pathMatch: 'full', component: WelcomeScreenComponent },
      { path: 'import-https', component: ImportHttpsComponent },
      { path: 'import-local', component: ImportLocalComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationRouting {
}
