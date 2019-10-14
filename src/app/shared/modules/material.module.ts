import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { A11yModule } from '@angular/cdk/a11y';

const reExportingModules = [
    MatButtonModule,
    MatDialogModule,
    A11yModule
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
