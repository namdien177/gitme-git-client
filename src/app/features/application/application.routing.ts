import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { ApplicationComponent } from './application.component';

const routes: Routes = [
  {
    path: '', component: ApplicationComponent, children: [
      { path: '', pathMatch: 'full', component: WelcomeScreenComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationRouting {
}
