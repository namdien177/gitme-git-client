import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material';
import {MatDialogModule} from '@angular/material/dialog';

const reExportingModules = [
    MatButtonModule,
    MatDialogModule
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
