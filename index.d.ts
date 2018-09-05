export declare type CommandName = 'clean-dist' | 'clean-pkg-json' | 'copy-files';
export declare function alo(args: CommandName | string[]): Promise<string>;
