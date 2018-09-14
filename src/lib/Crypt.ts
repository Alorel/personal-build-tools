import * as crypto from 'crypto';
import {isObject} from 'lodash';

const enum Conf {
  IV_RANDOM_BYTES = 16,
  SALT_RANDOM_BYTES = 64,
  KEY_ITERATIONS = 16384,
  KEY_LEN = 32,
  CIPHER = 'aes-256-gcm',
  HASH = 'sha512',
  IV_START = 64,
  TAG_START = 80,
  TEXT_START = 96
}

export interface Encrypted {
  __encrypted: string;
}

export class Crypt {
  public static decrypt(encrypted: string, password: string): string {
    const bData = Buffer.from(encrypted, 'base64');

    const salt = bData.slice(0, Conf.IV_START);
    const iv = bData.slice(Conf.IV_START, Conf.TAG_START);
    const tag = bData.slice(Conf.TAG_START, Conf.TEXT_START);
    const text = bData.slice(Conf.TEXT_START);

    const key = crypto.pbkdf2Sync(password, salt, Conf.KEY_ITERATIONS, Conf.KEY_LEN, Conf.HASH);
    const decipher = crypto.createDecipheriv(Conf.CIPHER, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
  }

  public static encrypt(text: string, password: string): string {
    const iv = crypto.randomBytes(Conf.IV_RANDOM_BYTES);
    const salt = crypto.randomBytes(Conf.SALT_RANDOM_BYTES);
    const key = crypto.pbkdf2Sync(password, salt, Conf.KEY_ITERATIONS, Conf.KEY_LEN, Conf.HASH);
    const cipher = crypto.createCipheriv(Conf.CIPHER, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, authTag, encrypted]).toString('base64');
  }

  public static encryptVar(text: string, password: string): Encrypted {
    return {__encrypted: Crypt.encrypt(text, password)};
  }

  public static isEncrypted(v: any): v is Encrypted {
    return !!v && isObject(v) && typeof v.__encrypted === 'string';
  }
}
