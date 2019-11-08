import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from './safe-html.pipe';
import { GitDiffPipe } from './git-diff.pipe';
import { BranchMinimizedPipe } from './branch-minimized.pipe';
import { RecentTimeDirective } from './recentTime.pipe';
import { GitCommitOptionsPipe } from './git-commit-options.pipe';

const reExporting = [
  SafeHtmlPipe,
  GitDiffPipe,
  BranchMinimizedPipe,
  RecentTimeDirective,
  GitCommitOptionsPipe,
];

@NgModule({
  declarations: [
    ...reExporting
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ...reExporting
  ]
})
export class SharedPipeModule {
}
