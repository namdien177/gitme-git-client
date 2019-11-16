import { Component, Input, OnInit } from '@angular/core';
import { createInitialState, LoadingIndicatorState } from '../../../state/system/Loading-Indicator';

@Component({
  selector: 'gitme-section-load',
  templateUrl: './section-load.component.html',
  styleUrls: ['./section-load.component.scss']
})
export class SectionLoadComponent implements OnInit {

  @Input()
  loadState: LoadingIndicatorState = createInitialState();

  ngOnInit() {
  }

}
