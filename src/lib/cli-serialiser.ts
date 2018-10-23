export module CLISerialiser {
  export function serialise(v: any): string {
    return Buffer.from(JSON.stringify(v), 'utf8').toString('base64');
  }

  export function unserialise<T = any>(v: string): T {
    return JSON.parse(Buffer.from(v, 'base64').toString('utf8'));
  }
}
