import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../services/electron.service';

@Component({
  selector: 'app-windows-frame',
  templateUrl: './windows-frame.component.html',
  styleUrls: ['./windows-frame.component.scss']
})
export class WindowsFrameComponent implements OnInit {

  constructor(
    private electronServices: ElectronService
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
}
