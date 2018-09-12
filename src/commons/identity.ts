import {Argv} from 'yargs';

export interface HasName {
  name: string;
}

export interface HasEmail {
  email: string;
}

export interface HasUserWebsite {
  userWebsite: string;
}

export function addName(argv: Argv): Argv {
  return argv.option('name', {
    describe: 'Your name',
    type: 'string'
  });
}

export function addEmail(argv: Argv): Argv {
  return argv.option('email', {
    describe: 'Your email',
    type: 'string'
  });
}

export function addUserWebsite(argv: Argv): Argv {
  return argv.option('user-website', {
    alias: 'uwebsite',
    describe: 'Your website',
    type: 'string'
  });
}
