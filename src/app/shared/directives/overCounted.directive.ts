import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[overCountDetection]'
})
export class OverCountedDirective implements OnInit {

  @Input() overCountWhenExceed = 1;
  @Input() value = null;
  @Input() plusAtFirst = false;

  constructor(
    private elementRef: ElementRef<HTMLDivElement | HTMLSpanElement | HTMLParagraphElement>,
    private renderer: Renderer2
  ) {
  }

  ngOnInit(): void {
    const currentText = this.elementRef.nativeElement.textContent.trim();
    if (this.value == null) {
      this.value = currentText;
    }
    const renderNode: (HTMLDivElement | HTMLSpanElement | HTMLParagraphElement) =
      this.renderer.selectRootElement(this.elementRef.nativeElement);
    if (isNaN(+this.value)) {
      renderNode.textContent = this.value;
    }
    let overNumber = '9';
    while (overNumber.length < this.overCountWhenExceed) {
      overNumber = overNumber + '9';
    }
    if (+this.value <= +overNumber) {
      renderNode.textContent = this.value;
    } else {
      if (this.plusAtFirst) {
        renderNode.textContent = '+' + overNumber;
      } else {
        renderNode.textContent = overNumber + '+';
      }
    }
  }


}
