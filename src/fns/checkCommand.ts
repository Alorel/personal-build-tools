import {Arguments} from 'yargs';

export function checkCommand(commands: string[], depth = 0): (argv: Arguments) => true | never {
  return (argv: Arguments): true | never => {
    const executedCommand: string = argv._[depth];

    for (const cmd of commands) {
      if (executedCommand === cmd) {
        return true;
      }
    }

    throw new Error(`Unknown command: ${executedCommand}`);
  };
}
