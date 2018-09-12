export declare type CommandName = 'clean-dist' | 'clean-pkg-json' | 'copy-files' | 'sort-deps';

export declare function alo(cmd: CommandName, ...args: string[]): Promise<string>;
export declare function alo(cmd: 'cfg', subcmd: 'clear' | 'rm' | 'set', ...args: string[]): Promise<string>;
