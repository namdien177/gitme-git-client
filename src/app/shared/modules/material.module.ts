import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material';

const reExportingModules = [
    MatButtonModule
];
const exportModules = [];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        ...reExportingModules
    ],
    exports: [
        ...reExportingModules
    ]
})
export class MaterialModule {
}
