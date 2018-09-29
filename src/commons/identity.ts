import {Options} from 'yargs';
import {Obj} from '../interfaces/OptionsObject';
import {Colour} from '../lib/Colour';

export interface HasName {
  name: string;
}

export interface HasEmail {
  email: string;
}

export interface HasUserWebsite {
  userWebsite: string;
}

export interface HasGhUser {
  ghUser: string;
}

export interface HasGhToken {
  ghToken: string;
}

export interface HasGhRepo {
  ghRepo: string;
}

export function addName(opts: Obj<Options>): void {
  opts.name = {
    describe: 'Your name',
    type: 'string'
  };
}

export function addEmail(opts: Obj<Options>): void {
  opts.email = {
    describe: 'Your email',
    type: 'string'
  };
}

export function addGhUser(opts: Obj<Options>): void {
  opts['gh-user'] = {
    alias: 'ghu',
    describe: 'Your GitHub username',
    type: 'string'
  };
}

export function addGhRepo(opts: Obj<Options>): void {
  opts['gh-repo'] = {
    alias: 'ghr',
    describe: 'Your GitHub repository',
    type: 'string'
  };
}

export function addGhToken(opts: Obj<Options>): void {
  opts['gh-token'] = {
    describe: `Your ${Colour.bold('global')} GitHub token used only by this CLI tool.`,
    type: 'string'
  };
}

export function addUserWebsite(opts: Obj<Options>): void {
  opts['user-website'] = {
    alias: 'uwebsite',
    describe: 'Your website',
    type: 'string'
  };
}
