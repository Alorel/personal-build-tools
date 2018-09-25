export interface NpmResponse {
  'dist-tags': {
    latest: string;
    [k: string]: string;
  };

  modified: string;

  name: string;

  versions: {
    [version: string]: {
      [k: string]: any;
    };
  };
}
