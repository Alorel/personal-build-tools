import * as fs from 'fs-extra';
import {LazyGetter} from 'lazy-get-decorator';
import {cloneDeep, isEmpty, memoize} from 'lodash';
import * as rl$ from 'readline-sync';
import {IS_CI} from '../const/IS_CI';
import {lastDirname} from '../fns/lastDirname';
import {readJson} from '../fns/readJson';
import {isLicense, License, LICENSE_VALUES} from '../inc/License';
import {PACKAGE_MANAGERS, PackageManager} from '../inc/PackageManager';
import {PackageJson} from '../interfaces/PackageJson';
import {Colour} from './Colour';
import {Git} from './Git';
import {getGhRepoData} from './sync-request/gh-repo/gh-repo';

//tslint:disable:max-file-line-count

const enum Conf {
  GH_TOK_URL = 'https://github.com/settings/tokens/new'
}

let rl: typeof rl$;

if (IS_CI) {
  rl = cloneDeep(rl$);

  function throwError() {
    throw new Error('Unable to prompt in test environment; Please set full configuration.');
  }

  for (const k of Object.keys(rl)) {
    if (typeof rl[k] === 'function') {
      rl[k] = throwError;
    }
  }
} else {
  rl = rl$;
}

interface GhMetadata {
  repo: string;

  user: string;
}

const memoisedFnNames: string[] = [];

function Memo(_target: any, prop: PropertyKey): void {
  memoisedFnNames.push(<string>prop);
}

export class PromptableConfig<T extends { [k: string]: any }> {

  public constructor(private readonly data: T) {
    for (const fn of memoisedFnNames) {
      this[fn] = memoize(this[fn]);
    }
  }

  /** @internal */
  public static get readline(): typeof rl {
    return rl;
  }

  @LazyGetter(true)
  public get ghRepoFromMetadata(): string | null {
    if (this.ghMetadata) {
      return this.ghMetadata.repo;
    }

    return null;
  }

  @LazyGetter(true)
  public get ghUserFromMetadata(): string | null {
    if (this.ghMetadata) {
      return this.ghMetadata.user;
    }

    return null;
  }

  @LazyGetter(true)
  private get ghMetadata(): GhMetadata | null {
    try {
      if (Git.originUrl) {
        const match = /([a-z0-9-_.]+)\/([a-z0-9-_.]+)\.git/i.exec(Git.originUrl);
        if (match) {
          return {
            repo: match[2], //tslint:disable-line:no-magic-numbers
            user: match[1]
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  public get<K extends keyof T>(k: K): T[K] {
    return this.data[k];
  }

  public has<K = T>(k: keyof K, strict = true): boolean {
    return strict ? this.data[<any>k] !== undefined : !!this.data[<any>k];
  }

  @Memo
  public promptedEmail(prop = 'email'): string {
    return this.getPromptEmail(prop, 'What\'s your email? ');
  }

  @Memo
  public promptedEncryptionPassword(prop = 'password'): string {
    return this.getPromptHidden(prop, 'Encryption password: ');
  }

  @Memo
  public promptedGhEmail(prop = 'ghEmail'): string {
    return this.getPromptEmail(prop, 'What\'s GitHub your email? ');
  }

  @Memo
  public promptedGhRepo(prop = 'ghRepo'): string {
    let msg = 'What is your GitHub repo';

    if (this.has(prop)) {
      return this.get<any>(prop);
    } else if (!IS_CI && this.ghRepoFromMetadata) {
      if (rl.keyInYNStrict(`Is your GitHub repo ${Colour.cyan(this.ghRepoFromMetadata)}? `)) {
        (<any>this.data)[prop] = this.ghRepoFromMetadata;

        return this.ghRepoFromMetadata;
      } else {
        return this.getPrompt(prop, `${msg} then? `);
      }
    }

    return this.getPrompt(prop, `${msg}? `);
  }

  @Memo
  public promptedGhToken(prop = 'ghToken'): string {
    return this.getPromptHidden(prop, [
      'What\'s your global GitHub token used only by this CLI tool?',
      `You can create one here: ${Conf.GH_TOK_URL} `
    ].join(' '));
  }

  @Memo
  public promptedGhUser(prop = 'ghUser'): string {
    let msg = 'What is your GitHub username';

    if (this.has(prop)) {
      return this.get<any>(prop);
    } else if (!IS_CI && this.ghUserFromMetadata) {
      if (rl.keyInYNStrict(`Is your GitHub username ${Colour.cyan(this.ghUserFromMetadata)}? `)) {
        (<any>this.data)[prop] = this.ghUserFromMetadata;

        return this.ghUserFromMetadata;
      } else {
        return this.getPrompt(prop, `${msg} then? `);
      }
    }

    return this.getPrompt(prop, `${msg}? `);
  }

  @Memo
  public promptedGpgKeyId(prop = 'gpgKeyId'): string {
    return this.getPromptHidden(prop, 'What\'s GPG key ID? ');
  }

  @Memo
  public promptedGpgKeyPwd(prop = 'gpgKeyPwd'): string {
    return this.getPromptHidden(prop, 'What\'s GPG key password? ');
  }

  @Memo
  public promptedGpgPrivkey(prop = 'gpgPrivkey'): string {
    return this.getPromptHidden(prop, 'Paste your GPG private key contents: ');
  }

  @Memo
  public promptedGpgPubkey(prop = 'gpgPubkey'): string {
    return this.getPrompt(prop, 'Paste your GPG public key contents: ');
  }

  @Memo
  public promptedLicense(prop = 'license'): License {
    let pjson: null | PackageJson;
    if (this.has(prop)) {
      return this.get(prop);
    } else if ((pjson = readJson()) && isLicense(pjson.license)) {
      (<any>this.data)[prop] = pjson.license;

      return pjson.license;
    }

    return this.getPromptSelect(prop, 'What license do you with to use? ', LICENSE_VALUES);
  }

  @Memo
  public promptedName(prop = 'name'): string {
    return this.getPrompt(prop, 'What\'s your name? ');
  }

  @Memo
  public promptedPkgMgr(prop = 'pkgMgr'): PackageManager {
    if (this.has(prop)) {
      return this.get(prop);
    }

    const files = fs.readdirSync(process.cwd(), 'utf8');
    if (files.includes('yarn.lock')) {
      return PackageManager.YARN;
    } else if (files.includes('package-lock.json')) {
      return PackageManager.NPM;
    } else {
      return this.getPromptSelect(prop, 'What package manager do you want to use? ', PACKAGE_MANAGERS);
    }
  }

  @Memo
  public promptedProjectDescription(prop = 'projectDesc'): string {
    if (this.has(prop)) {
      return this.get(prop);
    }
    const tok = this.promptedGhToken();
    const repo = this.promptedGhRepo();
    const user = this.promptedGhUser();
    const ghProjRemote = getGhRepoData(tok, user, repo);

    if (ghProjRemote && ghProjRemote.description) {
      (<any>this.data)[prop] = ghProjRemote.description;

      return this.data[prop];
    }

    return this.getPrompt(prop, 'What\'s your project description? ');
  }

  @Memo
  public promptedProjectKeywords(prop = 'projectKeywords'): string {
    return this.getPromptArray(prop, 'What are your project keywords?');
  }

  @Memo
  public promptedProjectName(prop = 'projectName'): string {
    const ask = (opt: string) => rl.keyInYNStrict(`Is your project name ${Colour.cyan(opt)}? `);
    let dir: string;

    if (this.has(prop)) {
      return this.get(prop);
    } else if (this.ghRepoFromMetadata && ask(this.ghRepoFromMetadata)) {
      (<any>this.data)[prop] = this.ghRepoFromMetadata;

      return this.ghRepoFromMetadata;
    } else if (ask((dir = lastDirname()))) {
      (<any>this.data)[prop] = dir;

      return dir;
    } else {
      return this.getPrompt(prop, 'What is your project name then? ');
    }
  }

  @Memo
  public promptedReleaseGhToken(prop = 'releaseGhToken'): string { //tslint:disable-line:max-line-length no-identical-functions
    return this.getPromptHidden(prop, [
      'What\'s your release GitHub token?',
      `You can create one here: ${Conf.GH_TOK_URL} `
    ].join(' '));
  }

  @Memo
  public promptedReleaseNpmToken(prop = 'releaseNpmToken'): string {
    return this.getPromptHidden(prop, 'What\'s your release NPM token? ');
  }

  @Memo
  public promptedTravisTokenOrg(prop = 'travisTokenOrg'): string {
    return this.getPromptHidden(prop, 'What\'s your travis-ci token? ');
  }

  @Memo
  public promptedTravisTokenPro(prop = 'travisTokenPro'): string {
    return this.getPromptHidden(prop, 'What\'s your travis-ci token? ');
  }

  @Memo
  public promptedUserWebsite(prop = 'userWebsite'): string {
    return this.getPromptEmail(prop, 'What\'s your name? ');
  }

  private getPrompt<K extends keyof T>(k: K, question: string, forbidEmpty = true, strict = true): T[K] {
    return this.promptCommon(k, () => rl.question(question), forbidEmpty, strict);
  }

  private getPromptArray<K extends keyof T>(k: K, question: string, forbidEmpty = true): T[K] {
    if (!isEmpty(this.get(k))) {
      return this.get(k);
    }
    const out: string[] = [];

    const run = () => {
      console.log(question);
      console.log('Enter an empty line when done');
      let response: string;
      do {
        response = rl.question('').trim();
        if (response) {
          out.push(response);
        }
      } while (response);

      if (forbidEmpty && !out.length) {
        run();
      }
    };
    run();
    this.data[k] = <any>out;

    return <any>out;
  }

  private getPromptEmail<K extends keyof T>(k: K, question: string, forbidEmpty = true, strict = true): T[K] {
    return this.promptCommon(k, () => rl.questionEMail(question), forbidEmpty, strict);
  }

  private getPromptHidden<K extends keyof T>(k: K, question: string, forbidEmpty = true, strict = true): string {
    return this.promptCommon(
      k,
      () => rl.question(question, {hideEchoBack: true, cancel: true}),
      forbidEmpty,
      strict
    );
  }

  private getPromptSelect<K extends keyof T>(k: K, question: string, opts: string[], strict = true): T[K] {
    if (this.has(<any>k, strict)) {
      return this.data[k];
    } else {
      const idx = rl.keyInSelect(opts, question, {cancel: false});
      this.data[k] = <any>opts[idx];

      return this.data[k];
    }
  }

  private promptCommon<K extends keyof T>(k: K, askFn: () => string, forbidEmpty: boolean, strict: boolean): T[K] {
    if (this.has(<any>k, strict)) {
      return this.data[k];
    } else if (forbidEmpty) {
      let v: string;
      do {
        v = askFn();
      } while (!v);

      this.data[k] = <any>v;

      return this.data[k];
    } else {
      this.data[k] = <any>askFn();

      return this.data[k];
    }
  }
}
