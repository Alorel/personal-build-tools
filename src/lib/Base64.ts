export module Base64 {
  export function encodeString(v: string): string {
    return Buffer.from(v, 'utf8').toString('base64');
  }

  export function decodeString(v: string): string {
    return Buffer.from(v, 'base64').toString('utf8');
  }
}
