import * as fs from 'fs-extra';
import {LazyGetter} from 'typescript-lazy-get-decorator';
import {Options} from 'yargs';
import {addPkgMgrToOptions} from '../../commons/addPkgMgr';
import {addGhRepo, addGhUser} from '../../commons/identity';
import {PackageManager} from '../../inc/PackageManager';
import {ContributingTpl} from '../../interfaces/ContributingTpl';
import {InitConf} from '../../interfaces/InitConf';
import {IssueTemplateBase} from '../../interfaces/IssueTemplateBase';
import {Obj} from '../../interfaces/OptionsObject';
import {PullRequestTpl} from '../../interfaces/PullRequestTpl';
import {Fixture} from '../Fixture';
import {Git} from '../Git';
import {Log} from '../Log';
import {PromptableConfig} from '../PromptableConfig';

export const options: Obj<Options> = {
  'skip-gh-issue-tpl': {
    default: false,
    describe: 'Skip issue & contribution template generation',
    type: 'boolean'
  }
};

addGhRepo(options);
addGhUser(options);
addPkgMgrToOptions(options);

class Initialiser {
  private readonly gitFiles: string[] = [];

  public constructor(private readonly c: PromptableConfig<InitConf>) {
    this.initContributing();
    this.initIssueTemplate();
    this.initPR();
    this.initIssueTemplates();
    this.gadd();
  }

  @LazyGetter()
  private get fix(): Fixture {
    return new Fixture('init/gh-templates');
  }

  @LazyGetter()
  private get ghRepo(): string {
    return this.c.promptedGhRepo();
  }

  @LazyGetter()
  private get ghUser(): string {
    return this.c.promptedGhUser();
  }

  @LazyGetter()
  private get issueTplBase(): string {
    return this.fix.read('issue_template_base.md').toString().trim();
  }

  private gadd(...files: string[]) {
    if (files.length) {
      this.gitFiles.push(...files);
    } else {
      Git.add(...this.gitFiles);
    }
  }

  private initContributing() {
    const yarnMsg = '- Please ensure you use [yarn package manager](https://yarnpkg.com) and not npm.';

    this.template<ContributingTpl>(
      'CONTRIBUTING.md',
      {
        extraLines: this.c.promptedPkgMgr() === PackageManager.YARN ? yarnMsg : '',
        ghRepo: this.ghRepo,
        ghUser: this.ghUser,
        pkgMgr: this.c.promptedPkgMgr()
      },
      '.github/CONTRIBUTING.md'
    );
  }

  private initIssueTemplate() {
    this.template<IssueTemplateBase>(
      'ISSUE_TEMPLATE.md',
      {issueTemplateBase: this.issueTplBase},
      '.github/ISSUE_TEMPLATE.md'
    );
  }

  private initIssueTemplates() {
    for (const name of ['bug_report', 'feature_request', 'guidance_request']) {
      this.template<IssueTemplateBase>(
        `ISSUE_TEMPLATE/${name}.md`,
        {issueTemplateBase: this.issueTplBase},
        `.github/ISSUE_TEMPLATE/${name}.md`,
        false
      );
    }
  }

  private initPR() {
    this.template<PullRequestTpl>(
      'PULL_REQUEST_TEMPLATE.md',
      {ghUser: this.ghUser, ghRepo: this.ghRepo},
      '.github/PULL_REQUEST_TEMPLATE.md'
    );
  }

  private template<T>(src: string, tpl: T, dest: string, ifNotExists = true) {
    if (!ifNotExists || !fs.pathExistsSync(dest)) {
      this.fix.template<T>(src, tpl, dest);
      this.gadd(dest);
    }
  }
}

export function handle(c: PromptableConfig<InitConf>): void {
  if (!c.get('skipGhIssueTpl')) {
    Log.info('Generating issue templates');
    new Initialiser(c);
    Log.success('Generated issue templates');
  } else {
    Log.info('Skipping issue templates');
  }
}
