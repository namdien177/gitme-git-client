import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

  private readonly prefix = 'gitme';

  static clear() {
    localStorage.clear();
  }

  set(keyName: string, data: string) {
    localStorage.setItem(this.prefix + '-' + keyName, data);
  }

  get(keyName: string) {
    return localStorage.getItem(this.prefix + '-' + keyName);
  }

  /**
   * Removing a key in localStorage
   * Returning true if the action is success
   * @param keyName key to check
   */
  remove(keyName: string) {
    const isExisted = this.isSet(keyName);
    if (isExisted) {
      localStorage.removeItem(this.prefix + '-' + keyName);
      return isExisted && !this.isSet(keyName);
    }
    return false;
  }

  /**
   * Check if the key in localStorage is set.
   * A set key is not guarantee to be not empty, it only checking the existence of the key.
   * @param keyName key to check
   */
  isSet(keyName: string) {
    return this.get(keyName) !== null;
  }

  /**
   * Check if the key in localStorage is empty.
   * Only an empty string will return true
   * @param keyName key to check
   */
  isEmpty(keyName: string) {
    return this.get(keyName) === '';
  }

  /**
   * Check if the key in localStorage contains data
   * Only an non-empty string in localStorage will return true
   * @param keyName key to check
   */
  isAvailable(keyName: string) {
    return this.isSet(keyName) && !this.isEmpty(keyName);
  }
}
