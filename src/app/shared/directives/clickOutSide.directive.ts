import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appIsClickOutside]'
})
export class ClickOutSideDirective {

  @Output()
  isOutside: EventEmitter<boolean> = new EventEmitter();

  @Input()
  whiteListClass = 'ngIfExceptionDirective';

  constructor(private elementRef: ElementRef) {

  }

  @HostListener('document:click', ['$event'])
  onMouseEnter(event: MouseEvent) {
    // @ts-ignore
    const isExceptionDOM = event.target.classList.contains(this.whiteListClass);
    const isClickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!isClickedInside && !isExceptionDOM) {
      this.isOutside.emit(true);
    } else {
      this.isOutside.emit(false);
    }
  }
}
