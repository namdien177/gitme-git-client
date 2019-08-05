/** Angular core modules */
import { ModuleWithProviders, NgModule } from '@angular/core';
/** Custom Utilities Services */
import { UtilityService } from './utility.service';

@NgModule()
export class UtilityModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: UtilityModule,
      providers: [
        UtilityService,
      ]
    };
  }
}
