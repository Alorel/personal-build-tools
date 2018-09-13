import * as chalk from 'chalk';

//tslint:disable-next-line:variable-name
export const Colour: chalk.Chalk = chalk['white'] ? <any>chalk : chalk['default'];
