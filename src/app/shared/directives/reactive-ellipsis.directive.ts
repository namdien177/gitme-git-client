import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { UtilityService } from '../utilities/utility.service';

@Directive({
  selector: '[reactiveEllipsis]'
})
export class ReactiveEllipsisDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() ellipsisType = '...';
  @Input() lineAllow = 1;
  @Input() textEllipsis = '';
  private nativeElement;
  private innerText = '';
  private changes: MutationObserver;
  private originalID = '';
  private alteredID = '';

  constructor(
    private elementRef: ElementRef<HTMLDivElement | HTMLSpanElement | HTMLParagraphElement>
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.nativeElement = this.elementRef.nativeElement;
    this.originalID = this.nativeElement.id;
    this.alteredID = this.nativeElement.id + 'ellipsis-block';
    this.nativeElement.id = this.alteredID;
    this.innerText = this.textEllipsis;

    const computedStyle = window.getComputedStyle(this.elementRef.nativeElement);
    let fontSize = UtilityService.htmlUnitToFixed(computedStyle.fontSize);
    fontSize = !!fontSize ? fontSize : 0;
    let lineHeight = UtilityService.htmlUnitToFixed(computedStyle.lineHeight);
    this.nativeElement.innerText = 't';
    const lineHeightReal = this.nativeElement.clientHeight;

    lineHeight = !!lineHeight ? lineHeight : 0;
    lineHeight = !!lineHeightReal ? lineHeightReal > lineHeight ? lineHeightReal : lineHeight : 0;
    const rowHeight = lineHeight > fontSize ? lineHeight : fontSize;
    if (rowHeight === 0) {
      return;
    }

    this.nativeElement.innerText = this.innerText;
    this.startEllipsis(rowHeight);
  }

  startEllipsis(currentRowHeight: number) {
    const node = this.elementRef.nativeElement;
    let messageHeight = this.elementRef.nativeElement.clientHeight;
    let linesIndicate = messageHeight / currentRowHeight;
    this.changes = new MutationObserver((mutations) => {
      mutations.forEach((domAffected) => {
        if ((domAffected.target as HTMLDivElement).id === this.alteredID) {
          messageHeight = this.elementRef.nativeElement.clientHeight;
          linesIndicate = messageHeight / currentRowHeight;
          if (linesIndicate > this.lineAllow) {
            node.innerText = node.innerText.substr(0, node.innerText.length - 4) + '...';
          }
        }
      });
    });

    this.changes.observe(node, {
      attributes: true,
      childList: true,
      characterData: true
    });

    if (linesIndicate > this.lineAllow) {
      node.innerText = node.innerText.substr(0, node.innerText.length - 1);
    }
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }
}
