import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../../../services/system/electron.service';
import { electronNGTypeOf, electronNode } from '../../../shared/types/types.electron';
import { FileSystemService } from '../../../services/system/fileSystem.service';

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
    private electronService: ElectronService,
    private fileSystemService: FileSystemService
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

  loginGithub(){
    // const url = this.fileSystemService.loginGithubUrl();
    // this.electronService.loadUrl(url);
    this.electronService.callLoginGithub();
  }
}
