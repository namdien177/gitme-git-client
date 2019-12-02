import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appIsClickOutside]'
})
export class ClickOutSideDirective {

  @Output()
  isOutside: EventEmitter<boolean> = new EventEmitter();

  @Input()
  whiteListClass: string | string[] = 'ngIfExceptionDirective';

  constructor(private elementRef: ElementRef) {

  }

  @HostListener('document:click', ['$event'])
  onMouseEnter(event: MouseEvent) {
    let toArrWhitelist = [];
    if (Array.isArray(this.whiteListClass)) {
      toArrWhitelist = this.whiteListClass;
    } else {
      toArrWhitelist = [this.whiteListClass];
    }
    let isExceptionDOM = false;
    if (toArrWhitelist.length > 0) {
      toArrWhitelist.every(cssClass => {
        if (this.isDomContainsClass(<HTMLElement>event.target, cssClass)) {
          isExceptionDOM = true;
          return false;
        }
        return true;
      });
    }
    const isClickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!isClickedInside && !isExceptionDOM) {
      this.isOutside.emit(true);
    } else {
      this.isOutside.emit(false);
    }
  }

  isDomContainsClass(dom: HTMLElement, classMatch: string) {
    if (dom.classList.contains(classMatch)) {
      return true;
    }

    if (dom.parentElement) {
      return this.isDomContainsClass(dom.parentElement, classMatch);
    }

    return false;
  }
}
