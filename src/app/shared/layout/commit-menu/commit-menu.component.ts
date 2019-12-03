import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FileStatusSummaryView, RepositoryStatusService } from '../../state/DATA/repository-status';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ArrayLengthShouldLargerThan } from '../../validate/customFormValidate';
import { UtilityService } from '../../utilities/utility.service';
import { RepositoriesService, Repository } from '../../state/DATA/repositories';
import { MatBottomSheet, MatDialog } from '@angular/material';
import { CommitOptionsComponent } from '../../components/commit/_dialogs/commit-options/commit-options.component';
import { CommitOptions, RepositoryBranchesService, RepositoryBranchSummary } from '../../state/DATA/branches';
import { defaultCommitOptionDialog } from '../../model/yesNoDialog.model';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { GitDiffService } from '../../state/DATA/git-diff';
import { Router } from '@angular/router';
import { RepositoriesMenuService } from '../../state/UI/repositories-menu';
import { SingleComponent } from '../../components/commit/_dialogs/context-option/single/single.component';
import { LoadingIndicatorService } from '../../state/UI/Loading-Indicator';

@Component({
  selector: 'gitme-commit-menu',
  templateUrl: './commit-menu.component.html',
  styleUrls: ['./commit-menu.component.scss'],
})
export class CommitMenuComponent implements OnInit, OnDestroy, AfterViewInit {
  isViewChangeTo: 'changes' | 'history' = 'changes';
  @Output()
  isViewChangeToChange: EventEmitter<'changes' | 'history'> = new EventEmitter<'changes' | 'history'>();

  repository: Repository = null;
  statusSummaryFileLength = 0;
  activeBranch: RepositoryBranchSummary = null;

  filesChanges: FileStatusSummaryView[] = [];

  formCommitment: FormGroup;
  checkboxAllFileStatus = false;
  customOptionCommit = false;

  private componentDestroyed: Subject<boolean> = new Subject<boolean>();

  constructor(
    private gitStatus: RepositoryStatusService,
    private gitBranch: RepositoryBranchesService,
    private gitRepository: RepositoriesService,
    private gitDiffs: GitDiffService,
    private appMenu: RepositoriesMenuService,
    private utilitiesService: UtilityService,
    public dialog: MatDialog,
    private ld: LoadingIndicatorService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private router: Router,
    private matBottomSheet: MatBottomSheet,
  ) {
  }

  get title() {
    return this.formCommitment.get('title');
  }

  get optional() {
    return this.formCommitment.get('optional');
  }

  get files() {
    return this.formCommitment.get('files');
  }

  ngAfterViewInit(): void {
    this.watchingRepository();
    this.watchingBranch();
    this.watchingSummary();
    this.watchingUI();
  }

  ngOnInit() {
    this.setupFormCommitment();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
  }

  eventEmitCheckBoxFile(event: boolean) {
    this.checkboxAllFileStatus = event;
  }

  setNewFilesCommit(files: FileStatusSummaryView[]) {
    const newFileList: FileStatusSummaryView[] = [];
    files.forEach(
      file => {
        if (file.checked) {
          newFileList.push(file);
        }
      },
    );

    // Update the formData
    this.files.setValue(newFileList);
  }

  toggleOptionCommit() {
    this.customOptionCommit = !this.customOptionCommit;
    if (this.customOptionCommit) {
      this.optional.setValue(this.activeBranch.options);
    } else {
      this.optional.setValue(null);
    }
  }

  switchView(toView: string) {
    switch (toView) {
      case 'changes':
        this.router.navigateByUrl('/');
        this.appMenu.viewCommitMenu(toView);
        break;
      case 'history':
        this.router.navigateByUrl('/history');
        this.appMenu.viewCommitMenu(toView);
        break;
      default:
        this.router.navigateByUrl('/');
        this.appMenu.viewCommitMenu('changes');
    }
    this.gitDiffs.reset();
  }

  toggleCheckboxAllFile(value: boolean) {
    if (!value) {
      this.gitStatus.uncheckAllCheckboxState();
    } else {
      this.gitStatus.checkAllCheckboxState();
    }
  }

  commitChanges() {
    if (this.formCommitment.invalid) {
      return;
    }

    const listFilesCommit: FileStatusSummaryView[] = this.files.value;
    const paths: string[] = this.utilitiesService.extractFilePathFromGitStatus(listFilesCommit);
    const activeRepository: Repository = this.gitRepository.getActive();
    let optionCommits = null;
    if (this.customOptionCommit) {
      // having custom option when commit
      optionCommits = this.optional.value;
    }
    this.ld.setLoading('Committing');
    this.gitRepository.commit(
      activeRepository,
      this.title.value,
      paths,
      optionCommits,
    ).pipe(
      switchMap(() => {
        this.formCommitment.reset();
        this.gitDiffs.reset();
        return this.gitStatus.status(this.repository);
      }),
    ).subscribe(status => {
      this.ld.setFinish();
    });
  }

  openCommitOptions() {
    const defaultDataCommit = defaultCommitOptionDialog;
    defaultDataCommit.data = this.activeBranch.options;
    const commitOptionResult = this.dialog.open(
      CommitOptionsComponent, {
        width: '550px',
        height: '400px',
        data: defaultDataCommit,
        panelClass: 'bg-primary-black-mat-dialog',
      },
    );

    commitOptionResult.afterClosed().subscribe(res => {
      let valPassed = null;
      if (Array.isArray(res)) {
        // save the array
        valPassed = this.parseSingleOptionCmd(res);
        this.activeBranch.options = res;
      }
      this.optional.setValue(valPassed);
    });
  }

  parseSingleOptionCmd(arrOptions: CommitOptions[]) {
    const finalOption = {};
    arrOptions.forEach(opt => {
      if (!!opt.argument && opt.argument.length > 0) {
        finalOption[opt.argument] = opt.value.length > 0 ? opt.value : null;
      } else {
        if (!!opt.value && opt.value.length > 0) {
          // make this as properties
          finalOption[opt.value] = null;
        }
      }
    });
    return finalOption;
  }

  toggleContextCheckbox() {
    const file = this.filesChanges;
    const dataTransfer = {
      file,
      repository: this.repository,
      mode: 'all',
    };
    const contextOpen = this.matBottomSheet.open(SingleComponent, {
      panelClass: ['bg-primary-black', 'p-2-option'],
      data: dataTransfer,
    });

    contextOpen.afterDismissed().subscribe(data => {
      console.log(data);
    });
  }

  private setupFormCommitment() {
    this.formCommitment = this.fb.group({
      title: ['', [Validators.required]],
      files: [[], [ArrayLengthShouldLargerThan(0)]],
      optional: [null, []],
    });
  }

  private watchingRepository() {
    this.gitRepository.selectActive()
    .subscribe(repoActive => {
      this.repository = repoActive;
    });
  }

  private watchingSummary() {
    this.gitStatus.select()
    .pipe(
      distinctUntilChanged(),
      map(summary => {
        this.filesChanges = summary.files;
        return summary.files.length;
      }),
    ).subscribe(changes => {
      this.statusSummaryFileLength = changes;
      this.cd.markForCheck();
    });
  }

  private watchingBranch() {
    this.gitBranch.select()
    .subscribe(
      listBranch => {
        this.activeBranch = listBranch.find(branch => {
          return branch.current;
        });

        if (this.activeBranch) {
          this.optional.setValue(this.activeBranch.options);
        }
      },
    );
  }

  private watchingUI() {
    this.appMenu.select().subscribe(uiState => {
      this.isViewChangeTo = uiState.commit_view;
      if (this.isViewChangeTo === 'changes') {
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/history']);
      }
      this.gitDiffs.reset();
    });
  }
}
