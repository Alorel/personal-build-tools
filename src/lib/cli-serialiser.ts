import {Base64} from './Base64';

export module CLISerialiser {
  export function serialise(v: any): string {
    return Base64.encodeString(JSON.stringify(v));
  }

  export function unserialise<T = any>(v: string): T {
    return JSON.parse(Base64.decodeString(v));
  }
}
