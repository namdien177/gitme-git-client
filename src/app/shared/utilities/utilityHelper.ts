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
