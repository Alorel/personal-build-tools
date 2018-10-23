export declare type CommandName = 'clean-dist'
  | 'clean-pkg-json'
  | 'copy-files'
  | 'sort-deps'
  | 'init'
  | 'cfg'
  | 'reinstall'
  | 'build'
  | 'config';

export declare function alo(cmd: CommandName | string[]): Promise<string>;
