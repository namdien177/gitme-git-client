import { Injectable } from '@angular/core';
import { cryptoNode, electronNG } from '../../shared/types/types.electron';
import * as crypto from 'crypto';
import { LocalStorageService } from './localStorage.service';
import { ELECTRON_APPS_UUID } from '../../common/define.common';

@Injectable()
export class SecurityService {

  private cryptoNode: typeof crypto;

  private instanceElectron: typeof electronNG.remote;
  private readonly secretUUID: string;
  private readonly IV_LENGTH = 16; // For AES, this is always 16

  constructor(
    private localStorageService: LocalStorageService
  ) {
    this.secretUUID = localStorageService.get(ELECTRON_APPS_UUID);
    this.instanceElectron = electronNG.remote;
    this.cryptoNode = cryptoNode;
  }

  encryptAES(password) {
    const secret = this.secretUUID.slice(0, 16);
    if (password.length > 50) {
      return false;
    }
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), iv);
    let encrypted = cipher.update(password);

    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decryptAES(encryptedAES) {
    const secret = this.secretUUID.slice(0, 16);
    const textParts = encryptedAES.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
