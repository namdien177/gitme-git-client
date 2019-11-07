import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../../../services/system/electron.service';
import { electronNGTypeOf, electronNode } from '../../../shared/types/types.electron';

@Component({
  selector: 'gitme-welcome-screen',
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.scss']
})
export class WelcomeScreenComponent implements OnInit {

  private readonly electron: electronNGTypeOf;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private electronService: ElectronService
  ) {
    this.electron = electronNode;
  }

  ngOnInit() {
  }

  cloneHTTPBtn() {
    this.router.navigateByUrl('application/import-https');
  }

  importLocalBtn() {
    this.router.navigateByUrl('application/import-local');
  }

  openGitHub() {
    this.electron.shell.openExternal('https://github.com/namdien177/gitme-git-client');
  }
}
