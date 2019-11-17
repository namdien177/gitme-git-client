import { RepositoryBranchSummary } from '../state/DATA/repository-branches';

const typeCache: { [label: string]: boolean } = {};

type Predicate = (oldValues: Array<any>, newValues: Array<any>) => boolean;

/**
 *  Matching this will require to be replaced with *-*
 *  Any these character in the name will be invalid (matched in regex.test)
 *  Because branch name can have - at the end so it's fine
 */
export const inNameBranchRules = /[\\\000-\037\177\s~^:?*\[\]|]|(--)|(\.\.)|(\/\/)|(.*@{.*)|(^@$)|(\.lock$)|(\.$)/g;
/**
 * Matching this will be removed
 * Any name that start with these character will be removed
 */
export const startNameBranchRules = /(^[\/\-\*\000-\037\177\s~^:?*\[|\.\\])/g;

/**
 * This function coerces a string into a string literal type.
 * Using tagged union types in TypeScript 2.0, this enables
 * powerful typechecking of our state.
 *
 * Since every action label passes through this function it
 * is a good place to ensure all of our action labels are unique.
 *
 * @param label
 */
export function type<T>(label: T | ''): T {
  if (typeCache[label as string]) {
    throw new Error(`Action type "${ label }" is not unqiue"`);
  }

  typeCache[label as string] = true;

  return label as T;
}

/**
 * Runs through every condition, compares new and old values and returns true/false depends on condition state.
 * This is used to distinct if two observable values have changed.
 *
 * @param oldValues
 * @param newValues
 * @param conditions
 */
export function distinctChanges(
  oldValues: Array<any>,
  newValues: Array<any>,
  conditions: Predicate[]
): boolean {
  return !conditions.every(cond => cond(oldValues, newValues));
}

export function compareArray(arr1, arr2) {

  // Check if the arrays are the same length
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Check if all items exist and are in the same order
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  // Otherwise, return true
  return true;
}

/**
 * Return false if two array different
 * @param oldBranches
 * @param newBranches
 */
export function compareBranchesArray(oldBranches: RepositoryBranchSummary[], newBranches: RepositoryBranchSummary[]) {
  if (oldBranches.length !== newBranches.length) {
    return false;
  }
  let identical = true;
  newBranches.every(newBranch => {
    const findInOld = oldBranches.find(br => br.name === newBranch.name);
    if (!findInOld) {
      identical = false;
      return false;
    }
    if (
      newBranch.has_local !== findInOld.has_local ||
      newBranch.has_remote !== findInOld.has_remote ||
      newBranch.current !== findInOld.current ||
      newBranch.last_update !== findInOld.last_update ||
      newBranch.commit !== findInOld.commit ||
      newBranch.label !== findInOld.label
    ) {
      identical = false;
      return false;
    }

    if (!newBranch.tracking !== !findInOld.tracking) {
      identical = false;
      return false;
    }

    if (!!newBranch.tracking) {
      Object.keys(newBranch.tracking).every(trk => {
        if (newBranch.tracking[trk] !== findInOld.tracking[trk]) {
          identical = false;
          return false;
        }
        return true;
      });
    }

    if (!identical) {
      return false;
    }

    if (!newBranch.options !== !findInOld.options) {
      identical = false;
      return false;
    }

    if (!!newBranch.options) {
      if (newBranch.options.length !== findInOld.options.length) {
        identical = false;
        return false;
      }

      newBranch.options.every(opt => {
        const oldOption = findInOld.options.find(op => op.value === opt.value && op.argument === opt.argument);
        if (!oldOption) {
          identical = false;
          return false;
        }
        return true;
      });
    }
    return identical;
  });
  return identical;
}

/**
 * Returns true if the given value is type of Object
 *
 * @param val
 */
export function isObject(val: any) {
  if (val === null) {
    return false;
  }

  return typeof val === 'function' || typeof val === 'object';
}

/**
 * Capitalizes the first character in given string
 *
 * @param s
 */
export function capitalize(s: string) {
  if (!s || typeof s !== 'string') {
    return s;
  }
  return s && s[0].toUpperCase() + s.slice(1);
}

/**
 * Uncapitalizes the first character in given string
 *
 * @param s
 */
export function uncapitalize(s: string) {
  if (!s || typeof s !== 'string') {
    return s;
  }
  return s && s[0].toLowerCase() + s.slice(1);
}

/**
 * Flattens multi dimensional object into one level deep
 *
 * @param ob
 * @param preservePath
 */
export function flattenObject(ob: any, preservePath: boolean = false): any {
  const toReturn = {};

  for (const i in ob) {
    if (!ob.hasOwnProperty(i)) {
      continue;
    }

    if (typeof ob[i] === 'object') {
      const flatObject = flattenObject(ob[i], preservePath);
      for (const x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) {
          continue;
        }

        const path = preservePath ? i + '.' + x : x;

        toReturn[path] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }

  return toReturn;
}

/**
 * Returns formated date based on given culture
 *
 * @param dateString
 * @param culture
 */
export function localeDateString(dateString: string, culture: string = 'en-EN'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(culture);
}

export function isValidNameGitBranch(nameBranch: string): { status: boolean; msg?: string; name?: string } {
  // check first part
  const originalName = nameBranch;
  let firstPartInvalid = false;
  if (nameBranch.match(startNameBranchRules)) {
    // Matched
    firstPartInvalid = true;
    nameBranch = nameBranch.replace(startNameBranchRules, '');

    if (nameBranch.length === 0) {
      return {
        status: false,
        msg: `${ originalName } is not a valid name branch`
      };
    } else if (nameBranch.length === 1) {
      return {
        status: false,
        msg: `Branch will be changed to: ${ nameBranch }`,
        name: nameBranch
      };
    }
    // Continue to valid inner string
  }

  if (nameBranch.match(inNameBranchRules)) {
    // Match inner
    nameBranch = nameBranch.replace(inNameBranchRules, '-');

    if (nameBranch.length === 0) {
      return {
        status: false,
        msg: `${ originalName } is not a valid name branch`
      };
    } else {
      return {
        status: false,
        msg: `Branch will be changed to: ${ nameBranch }`,
        name: nameBranch
      };
    }
  }

  return {
    status: !firstPartInvalid,
    msg: firstPartInvalid ? `Branch will be changed to: ${ nameBranch }` : null,
    name: nameBranch
  };
}

function deepCompare() {
  let i, l, leftChain, rightChain;

  function compare2Objects(x, y) {
    let p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
      return true;
    }

    // Compare primitives and functions.
    // Check if both arguments link to the same object.
    // Especially useful on the step where we compare prototypes
    if (x === y) {
      return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((typeof x === 'function' && typeof y === 'function') ||
      (x instanceof Date && y instanceof Date) ||
      (x instanceof RegExp && y instanceof RegExp) ||
      (x instanceof String && y instanceof String) ||
      (x instanceof Number && y instanceof Number)) {
      return x.toString() === y.toString();
    }

    // At last checking prototypes as good as we can
    if (!(x instanceof Object && y instanceof Object)) {
      return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
      return false;
    }

    if (x.constructor !== y.constructor) {
      return false;
    }

    if (x.prototype !== y.prototype) {
      return false;
    }

    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
      return false;
    }

    // Quick checking of one object being a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      } else if (typeof y[p] !== typeof x[p]) {
        return false;
      }
    }

    for (p in x) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      } else if (typeof y[p] !== typeof x[p]) {
        return false;
      }

      switch (typeof (x[p])) {
        case 'object':
        case 'function':

          leftChain.push(x);
          rightChain.push(y);

          if (!compare2Objects(x[p], y[p])) {
            return false;
          }

          leftChain.pop();
          rightChain.pop();
          break;

        default:
          if (x[p] !== y[p]) {
            return false;
          }
          break;
      }
    }

    return true;
  }

  if (arguments.length < 1) {
    return true; // Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (i = 1, l = arguments.length; i < l; i++) {

    leftChain = []; // Todo: this can be cached
    rightChain = [];

    if (!compare2Objects(arguments[0], arguments[i])) {
      return false;
    }
  }

  return true;
}

export function deepEquals(x, y, exceptionName?: string) {
  if (x === y) {
    return true; // if both x and y are null or undefined and exactly the same
  } else if (!(x instanceof Object) || !(y instanceof Object)) {
    return false; // if they are not strictly equal, they both need to be Objects
  } else if (x.constructor !== y.constructor) {
    // they must have the exact same prototype chain, the closest we can do is
    // test their constructor.
    return false;
  } else {
    for (const p in x) {
      if (!x.hasOwnProperty(p)) {
        continue; // other properties were tested using x.constructor === y.constructor
      }
      if (!y.hasOwnProperty(p)) {
        return false; // allows to compare x[ p ] and y[ p ] when set to undefined
      }
      if (x[p] === y[p] || (!!exceptionName && p === exceptionName)) {
        continue; // if they have the same strict value or identity then they are equal
      }
      if (typeof (x[p]) !== 'object') {
        return false; // Numbers, Strings, Functions, Booleans must be strictly equal
      }
      if (!deepEquals(x[p], y[p])) {
        return false;
      }
    }
    for (const p in y) {
      if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
        return false;
      }
    }
    return true;
  }
}

export function deepMutableObject(objectImmutable: object) {
  const retObj: any = {};

  if (objectImmutable === null || objectImmutable === undefined) {
    return objectImmutable;
  }

  // foreach every key and reassign for retObject
  Object.keys(objectImmutable).forEach(prob => {
    // if not object/array => assign value and continue
    if (typeof objectImmutable[prob] === 'object') {
      if (Array.isArray(objectImmutable[prob])) {
        const arrayImmutable = [];
        Array.from(objectImmutable[prob]).forEach((member: any) => {
          const objectInner = deepMutableObject(member);
          arrayImmutable.push(objectInner);
        });
        retObj[prob] = arrayImmutable;
      } else {
        retObj[prob] = deepMutableObject(objectImmutable[prob]);
      }
    } else {
      retObj[prob] = objectImmutable[prob];
    }
  });

  return retObj;
}
