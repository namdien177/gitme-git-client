import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ElectronService } from '../../../services/system/electron.service';
import { AppConfig } from '../../model/App-Config';
import { DataService } from '../../../services/features/core/data.service';
import { SecurityService } from '../../../services/system/security.service';

@Component({
  selector: 'gitme-windows-frame',
  templateUrl: './windows-frame.component.html',
  styleUrls: ['./windows-frame.component.scss']
})
export class WindowsFrameComponent implements OnInit, AfterViewInit {

  appConfig: AppConfig = null;
  idApp: string = null;

  constructor(
    private electronServices: ElectronService,
    private securityService: SecurityService,
    private dataService: DataService
  ) {
  }

  ngOnInit() {
  }

  minimizeWindows() {
    this.electronServices.minimizeApplication();
  }

  closeWindows() {
    this.electronServices.closeApplication();
  }

  ngAfterViewInit(): void {
    this.idApp = this.securityService.appUUID;
    this.dataService.getConfigAppData(this.idApp).then(
      config => {
        console.log(config);
        if (!!config) {
          this.appConfig = config;
        }
      }
    );
  }
}
