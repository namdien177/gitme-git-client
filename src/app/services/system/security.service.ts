import { Injectable } from '@angular/core';
import { cryptoNode, electronNode, uuidNode } from '../../shared/types/types.electron';
import * as crypto from 'crypto';
import { LocalStorageService } from './localStorage.service';
import { DefineCommon } from '../../common/define.common';
import { machineIdSync } from 'node-machine-id';

@Injectable()
export class SecurityService {

  private cryptoNode: typeof crypto;

  private instanceElectron: typeof electronNode.remote;
  private readonly secretUUID: string;
  private readonly IV_LENGTH = 16; // For AES, this is always 16

  constructor(
    private localStorageService: LocalStorageService
  ) {
    this.secretUUID = localStorageService.get(DefineCommon.ELECTRON_APPS_UUID_KEYNAME);
    if (!this.secretUUID) {
      this.secretUUID = machineIdSync();
    }
    this.instanceElectron = electronNode.remote;
    this.cryptoNode = cryptoNode;
  }

  get randomID() {
    const genUUID: string = uuidNode();
    return genUUID;
  }

  get appUUID() {
    return this.secretUUID;
  }

  encryptAES(password) {
    const secret = this.secretUUID.slice(0, 32);
    if (password.length > 50 || password.length < 2) {
      return null;
    }
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), iv);
    let encrypted = cipher.update(password);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decryptAES(encryptedAES) {
    const secret = this.secretUUID.slice(0, 32);
    const textParts = encryptedAES.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }
}
