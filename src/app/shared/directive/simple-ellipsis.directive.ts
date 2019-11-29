import { AfterViewInit, Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[simpleEllipsis]'
})
export class SimpleEllipsisDirective implements OnInit, AfterViewInit {

  @Input() showLength = 20;
  @Input() ellipsisType = '...';

  constructor(
    private elementRef: ElementRef<HTMLDivElement | HTMLSpanElement | HTMLParagraphElement>,
    private renderer: Renderer2
  ) {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    const currentLength = this.elementRef.nativeElement.textContent.trim().length;
    const currentText = this.elementRef.nativeElement.textContent.trim();
    let finalText = currentText;
    if (currentLength > this.showLength) {
      finalText = currentText.substr(0, this.showLength).trim();
    }
    if (finalText.length < this.showLength) {
      this.showLength = finalText.length;
    }
    while (finalText.charAt(this.showLength - 1).match(/^[.,\/\\?*]$/)) {
      finalText = finalText.substr(0, this.showLength - 1);

    }
    const renderNode: (HTMLDivElement | HTMLSpanElement | HTMLParagraphElement) =
      this.renderer.selectRootElement(this.elementRef.nativeElement);
    renderNode.textContent = finalText + this.ellipsisType;
  }


}
