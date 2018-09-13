import {cloneDeep, memoize} from 'lodash';
import * as rl$ from 'readline-sync';
import {LazyGetter} from 'typescript-lazy-get-decorator';
import {IS_CI} from '../const/IS_CI';
import {License, LICENSE_VALUES} from '../inc/License';
import {PACKAGE_MANAGERS, PackageManager} from '../inc/PackageManager';
import {Colour} from './Colour';
import {Git} from './Git';

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

const memoisedFns: string[] = [];

function Memo(_target: any, prop: PropertyKey): void {
  memoisedFns.push(<string>prop);
}

export class PromptableConfig<T extends { [k: string]: any }> {

  public constructor(private readonly data: T) {
    for (const fn of memoisedFns) {
      this[fn] = memoize(this[fn]);
    }
  }

  @LazyGetter()
  public get ghRepoFromMetadata(): string | null {
    if (this.ghMetadata) {
      return this.ghMetadata.repo;
    }

    return null;
  }

  @LazyGetter()
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
  public promptedGhRepo(prop = 'ghRepo'): string {
    let msg = 'What is your GitHub repo';

    if (this.has(prop)) {
      return this.get<any>(prop);
    } else if (!IS_CI && this.ghRepoFromMetadata) {
      if (rl.keyInYNStrict(`Is your GitHub repo ${Colour.cyan(this.ghRepoFromMetadata)}? `)) {
        return this.ghRepoFromMetadata;
      } else {
        return this.getPrompt(prop, `${msg} then? `);
      }
    }

    return this.getPrompt(prop, `${msg}? `);
  }

  @Memo
  public promptedGhUser(prop = 'ghUser'): string {
    let msg = 'What is your GitHub username';

    if (this.has(prop)) {
      return this.get<any>(prop);
    } else if (!IS_CI && this.ghUserFromMetadata) {
      if (rl.keyInYNStrict(`Is your GitHub username ${Colour.cyan(this.ghUserFromMetadata)}? `)) {
        return this.ghUserFromMetadata;
      } else {
        return this.getPrompt(prop, `${msg} then? `);
      }
    }

    return this.getPrompt(prop, `${msg}? `);
  }

  @Memo
  public promptedLicense(prop = 'license'): License {
    return this.getPromptSelect(prop, 'What license do you with to use? ', LICENSE_VALUES);
  }

  @Memo
  public promptedName(prop = 'name'): string {
    return this.getPrompt(prop, 'What\'s your name? ');
  }

  @Memo
  public promptedPkgMgr(prop = 'pkgMgr'): PackageManager {
    return this.getPromptSelect(prop, 'What package manager do you want to use? ', PACKAGE_MANAGERS);
  }

  @Memo
  public promptedUserWebsite(prop = 'userWebsite'): string {
    return this.getPromptEmail(prop, 'What\'s your name? ');
  }

  private getPrompt<K extends keyof T>(k: K, question: string, forbidEmpty = true, strict = true): T[K] {
    return this.promptCommon(k, () => rl.question(question), forbidEmpty, strict);
  }

  private getPromptEmail<K extends keyof T>(k: K, question: string, forbidEmpty = true, strict = true): T[K] {
    return this.promptCommon(k, () => rl.questionEMail(question), forbidEmpty, strict);
  }

  private getPromptSelect<K extends keyof T>(k: K, question: string, opts: string[], strict = true): T[K] {
    if (this.has(k, strict)) {
      return this.data[k];
    } else {
      const idx = rl.keyInSelect(opts, question, {cancel: false});
      this.data[k] = opts[idx];

      return this.data[k];
    }
  }

  private promptCommon<K extends keyof T>(k: K, askFn: () => string, forbidEmpty: boolean, strict: boolean): T[K] {
    if (this.has(k, strict)) {
      return this.data[k];
    } else if (forbidEmpty) {
      let v: string;
      do {
        v = askFn();
      } while (!v);

      this.data[k] = v;

      return this.data[k];
    } else {
      this.data[k] = askFn();

      return this.data[k];
    }
  }
}
