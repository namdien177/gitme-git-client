import { Injectable } from '@angular/core';


@Injectable()
export class UtilityService {
  constructor() {
  }

  static htmlUnitToFixed(strUnit: string): number {
    if (!isNaN(+strUnit)) {
      return null;
    }
    if (strUnit.includes('px') ||   // for px
      strUnit.includes('e') ||    // for em, ex
      strUnit.includes('v') ||    // for vw, vh
      strUnit.includes('r') ||    // for rem
      strUnit.includes('c')       // for ch
    ) {
      return +strUnit.substr(0, strUnit.length - 2);
    }

    return +strUnit.substr(0, strUnit.length - 1);
  }
}
