/** Angular core modules */
import { ModuleWithProviders, NgModule } from '@angular/core';

/** Custom Utilities Services */

@NgModule()
export class UtilityModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: UtilityModule,
            providers: []
        };
    }
}
