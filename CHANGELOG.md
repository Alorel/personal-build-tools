# [4.4.0](https://github.com/Alorel/personal-build-tools/compare/4.3.2...4.4.0) (2018-12-04)


### Features

* add strictBindCallApply tsconfig flag ([231a6cf](https://github.com/Alorel/personal-build-tools/commit/231a6cf))


### Maintenance

* **init:** Remove `sudo` from generated .travis.yml files as it is getting retired ([04c4986](https://github.com/Alorel/personal-build-tools/commit/04c4986))

## [4.3.2](https://github.com/Alorel/personal-build-tools/compare/4.3.1...4.3.2) (2018-11-12)


### Dependency updates

* **package:** update rollup-plugin-typescript2 to version 0.18.0 ([7b39e3a](https://github.com/Alorel/personal-build-tools/commit/7b39e3a))

## [4.3.1](https://github.com/Alorel/personal-build-tools/compare/4.3.0...4.3.1) (2018-11-09)


### Dependency updates

* **package:** update rollup to version 0.67.0 ([7eb0086](https://github.com/Alorel/personal-build-tools/commit/7eb0086))

# [4.3.0](https://github.com/Alorel/personal-build-tools/compare/4.2.2...4.3.0) (2018-11-02)


### Features

* **init:** Add lts/dubnium to generated node versions in .travis.yml ([6cb358b](https://github.com/Alorel/personal-build-tools/commit/6cb358b))


### Maintenance

* **init:** Remove lts/boron from generated node versions in .travis.yml ([83955da](https://github.com/Alorel/personal-build-tools/commit/83955da))

## [4.2.2](https://github.com/Alorel/personal-build-tools.git/compare/4.2.1...4.2.2) (2018-10-29)


### Bug Fixes

* **build:** rollup-plugin-node-resolve is now applied to the correct settings object ([c163396](https://github.com/Alorel/personal-build-tools.git/commit/c163396))

## [4.2.1](https://github.com/Alorel/personal-build-tools.git/compare/4.2.0...4.2.1) (2018-10-29)


### Bug Fixes

* Add rollup-plugin-node-resolve ([59b1552](https://github.com/Alorel/personal-build-tools.git/commit/59b1552))
* Remove prebuild as default script ([9d0a147](https://github.com/Alorel/personal-build-tools.git/commit/9d0a147))
* Remove typescript as default dependency ([6241449](https://github.com/Alorel/personal-build-tools.git/commit/6241449))

# [4.2.0](https://github.com/Alorel/personal-build-tools.git/compare/4.1.3...4.2.0) (2018-10-28)


### Bug Fixes

* Add /.alobuild-tsconfig-*.json to generated gitignore ([5a05cc7](https://github.com/Alorel/personal-build-tools.git/commit/5a05cc7))


### Features

* The build command is now available ([8f05fa5](https://github.com/Alorel/personal-build-tools.git/commit/8f05fa5))


### Maintenance

* semantic-release/npm no longer included in default package.json dependencies ([e0ac168](https://github.com/Alorel/personal-build-tools.git/commit/e0ac168))
* **init:** Travis release is now triggered on node version lts/* ([b69b1fa](https://github.com/Alorel/personal-build-tools.git/commit/b69b1fa))
* **package:** Remove [@types](https://github.com/types)/moment dev dependency ([2e7ecce](https://github.com/Alorel/personal-build-tools.git/commit/2e7ecce))


### Refactoring

* Remove js-base64 dependency ([7078f6f](https://github.com/Alorel/personal-build-tools.git/commit/7078f6f))

## [4.1.3](https://github.com/Alorel/personal-build-tools/compare/4.1.2...4.1.3) (2018-10-14)


### Bug Fixes

* File paths should now get separated properly on Windows ([d9c3346](https://github.com/Alorel/personal-build-tools/commit/d9c3346))


### Refactoring

* Refactor code for new tslint rules ([23d4112](https://github.com/Alorel/personal-build-tools/commit/23d4112))

## [4.1.2](https://github.com/Alorel/personal-build-tools/compare/4.1.1...4.1.2) (2018-10-09)


### Bug Fixes

* **init:** .travis.yml now gets the correct preparation scripts generated ([0d22e2b](https://github.com/Alorel/personal-build-tools/commit/0d22e2b))
* ObjectWriter now writes proper YAML without inlining anything ([a98b859](https://github.com/Alorel/personal-build-tools/commit/a98b859))

## [4.1.1](https://github.com/Alorel/personal-build-tools/compare/4.1.0...4.1.1) (2018-10-05)


### Bug Fixes

* Project dirname should now get resolved correctly ([97c09f8](https://github.com/Alorel/personal-build-tools/commit/97c09f8))

# [4.1.0](https://github.com/Alorel/personal-build-tools/compare/4.0.2...4.1.0) (2018-10-05)


### Bug Fixes

* The prompted project name now correctly uses the working directory name for its suggestions ([a3dd91f](https://github.com/Alorel/personal-build-tools/commit/a3dd91f))


### Features

* **init:** Added the ability to continue after an unsuccessful travis-ci environment setup ([4a7dccf](https://github.com/Alorel/personal-build-tools/commit/4a7dccf))

## [4.0.2](https://github.com/Alorel/personal-build-tools/compare/4.0.1...4.0.2) (2018-10-03)


### Bug Fixes

* **reinstall:** Corrected reinstall command log messages ([c5841e8](https://github.com/Alorel/personal-build-tools/commit/c5841e8))

## [4.0.1](https://github.com/Alorel/personal-build-tools/compare/4.0.0...4.0.1) (2018-10-03)


### Bug Fixes

* **reinstall:** The reinstall command now has logging as per initial design ([42ad150](https://github.com/Alorel/personal-build-tools/commit/42ad150))

# [4.0.0](https://github.com/Alorel/personal-build-tools/compare/3.3.1...4.0.0) (2018-09-29)


### Bug Fixes

* **init:** Add .alobuild-prep-release.sh to git ([0d927a3](https://github.com/Alorel/personal-build-tools/commit/0d927a3))
* **init:** Add nycrc to git ([c5da334](https://github.com/Alorel/personal-build-tools/commit/c5da334))
* **PromptableConfig:** Correct license type is now returned ([aa0f81d](https://github.com/Alorel/personal-build-tools/commit/aa0f81d))
* **PromptableConfig:** You should now be nagged until you input a GitHub repo/user ([363ed4f](https://github.com/Alorel/personal-build-tools/commit/363ed4f))
* default cfg file name should now differentiate between test suite runs and general runs within a CI environment ([48bb279](https://github.com/Alorel/personal-build-tools/commit/48bb279))
* PromptableConfig now respects the pkgMgr option ([6b8f698](https://github.com/Alorel/personal-build-tools/commit/6b8f698))


### Features

* **cfg:** Allow encrypting variables from CLI args and input files ([#16](https://github.com/Alorel/personal-build-tools/issues/16)) ([3a5cb9b](https://github.com/Alorel/personal-build-tools/commit/3a5cb9b))
* **init:** GitHub issue template generation ([671187d](https://github.com/Alorel/personal-build-tools/commit/671187d))
* **init:** License now gets set in package.json ([202a592](https://github.com/Alorel/personal-build-tools/commit/202a592))
* **PromptableConfig:** Package manager can now be inferred ([c833ef4](https://github.com/Alorel/personal-build-tools/commit/c833ef4))
* A fully configured travis-ci + semantic-release setup is now available ([2d63255](https://github.com/Alorel/personal-build-tools/commit/2d63255))
* Add Apache-2.0, GPL-3.0 licenses ([3151e35](https://github.com/Alorel/personal-build-tools/commit/3151e35))
* generate .nycrc ([ccfca1b](https://github.com/Alorel/personal-build-tools/commit/ccfca1b))
* License can now be inferred from package.json ([57c5257](https://github.com/Alorel/personal-build-tools/commit/57c5257))
* Prompt for GH user/repo from git metadata ([8b4e2f7](https://github.com/Alorel/personal-build-tools/commit/8b4e2f7))
* Reinstall command ([fac6ba5](https://github.com/Alorel/personal-build-tools/commit/fac6ba5))
* Set package.json defaults; init tslint, tsconfig, webpack, src, test ([bd68807](https://github.com/Alorel/personal-build-tools/commit/bd68807))


### Maintenance

* Generate GitHub templates ([4347a6d](https://github.com/Alorel/personal-build-tools/commit/4347a6d))
* Remove old encoded gpg key file ([8ebe6f9](https://github.com/Alorel/personal-build-tools/commit/8ebe6f9))


### Performance Improvements

* **LineReadWriter:** dirname is now cached ([ea856b8](https://github.com/Alorel/personal-build-tools/commit/ea856b8))


### Refactoring

* **init:** Add script sorting ([229363c](https://github.com/Alorel/personal-build-tools/commit/229363c))
* **init:** Default license no longer set. ([11412e4](https://github.com/Alorel/personal-build-tools/commit/11412e4))
* **init:** Default package manager no longer set. ([6398804](https://github.com/Alorel/personal-build-tools/commit/6398804))
* **init:** Split up init command options ([cb73f7c](https://github.com/Alorel/personal-build-tools/commit/cb73f7c))


### BREAKING CHANGES

* **init:** Default package manager no longer set and is now prompted; this would break CI environments if they depend on the command.
* **init:** Default license no longer set and is now prompted; this would break CI environments if they depend on the command.

## [3.3.1](https://github.com/Alorel/personal-build-tools/compare/3.3.0...3.3.1) (2018-09-13)

# [3.3.0](https://github.com/Alorel/personal-build-tools/compare/3.2.1...3.3.0) (2018-09-12)


### Bug Fixes

* **index.d.ts:** Fix typings ([59f940f](https://github.com/Alorel/personal-build-tools/commit/59f940f))
* **LineReadWriter:** mkdirp the path before writing ([aa93a10](https://github.com/Alorel/personal-build-tools/commit/aa93a10))
* **package:** tslib is now a production dependency ([ffc2607](https://github.com/Alorel/personal-build-tools/commit/ffc2607))


### Features

* **init:** Generate .github/CODEOWNERS ([3b446b2](https://github.com/Alorel/personal-build-tools/commit/3b446b2))
* **init:** Generate .gitignore ([dc95d37](https://github.com/Alorel/personal-build-tools/commit/dc95d37))
* **init:** Modified files are now automatically `git add`ed ([3506326](https://github.com/Alorel/personal-build-tools/commit/3506326))
* Add formatted tslint support ([345b8a6](https://github.com/Alorel/personal-build-tools/commit/345b8a6))
* init command added with license support ([d64b8ae](https://github.com/Alorel/personal-build-tools/commit/d64b8ae))


### Maintenance

* **GitHub:** Generate CODEOWNERS ([bcbef6c](https://github.com/Alorel/personal-build-tools/commit/bcbef6c))

## [3.2.1](https://github.com/Alorel/personal-build-tools/compare/3.2.0...3.2.1) (2018-09-12)


### Bug Fixes

* **index.d.ts:** Update typings ([db3e70a](https://github.com/Alorel/personal-build-tools/commit/db3e70a))

# [3.2.0](https://github.com/Alorel/personal-build-tools/compare/3.1.0...3.2.0) (2018-09-11)


### Features

* cfg command ([#8](https://github.com/Alorel/personal-build-tools/issues/8)) ([4ae414a](https://github.com/Alorel/personal-build-tools/commit/4ae414a))
* sort-deps command ([f129b03](https://github.com/Alorel/personal-build-tools/commit/f129b03))


### Refactoring

* Commands now use .option() ([69f945c](https://github.com/Alorel/personal-build-tools/commit/69f945c))

# [3.1.0](https://github.com/Alorel/personal-build-tools/compare/3.0.1...3.1.0) (2018-09-08)


### Features

* Commands will now exit with a non-zero code if an unknown command is specified ([9e8182a](https://github.com/Alorel/personal-build-tools/commit/9e8182a))

## [3.0.1](https://github.com/Alorel/personal-build-tools/compare/3.0.0...3.0.1) (2018-09-06)


### Bug Fixes

* **clean-dist:** empty dist dirs are now deleted synchronously ([b867a01](https://github.com/Alorel/personal-build-tools/commit/b867a01))


### Maintenance

* **package:** Add delete-empty types ([a0b1492](https://github.com/Alorel/personal-build-tools/commit/a0b1492))

# [3.0.0](https://github.com/Alorel/personal-build-tools/compare/2.0.1...3.0.0) (2018-09-05)


### Bug Fixes

* **copy-files:** --from and --to now have -f and -t aliases ([465ed71](https://github.com/Alorel/personal-build-tools/commit/465ed71))


### Features

* **config:** Global configuration can now be provided in ~/.alobuild.yml ([f7e6a09](https://github.com/Alorel/personal-build-tools/commit/f7e6a09))


### Maintenance

* Remove pkgConf option ([f9171ee](https://github.com/Alorel/personal-build-tools/commit/f9171ee))


### BREAKING CHANGES

* Config can no longer be specified in package.json

## [2.0.1](https://github.com/Alorel/personal-build-tools/compare/2.0.0...2.0.1) (2018-09-05)


### Bug Fixes

* **package:** Fix submitted README.md ([d06cdd9](https://github.com/Alorel/personal-build-tools/commit/d06cdd9))

# [2.0.0](https://github.com/Alorel/personal-build-tools/compare/1.0.0...2.0.0) (2018-09-05)


### Bug Fixes

* **clean-dist:** No longer display invalid help for --dist-dirs ([53281a7](https://github.com/Alorel/personal-build-tools/commit/53281a7))
* **clean-pkg-json:** publishConfig is no longer removed from package.json ([7bdd0a2](https://github.com/Alorel/personal-build-tools/commit/7bdd0a2))
* **package:** Add LICENSE, README and CHANGELOG to dist ([1528829](https://github.com/Alorel/personal-build-tools/commit/1528829))


### Features

* clean-dist command ([#3](https://github.com/Alorel/personal-build-tools/issues/3)) ([7dd843a](https://github.com/Alorel/personal-build-tools/commit/7dd843a))
* clean-pkg-json command ([ccb89fc](https://github.com/Alorel/personal-build-tools/commit/ccb89fc))
* Reworked config files to allow global & per-command config ([c47bf23](https://github.com/Alorel/personal-build-tools/commit/c47bf23))
* **clean-dist:** Now removes empty dirs too ([53c1439](https://github.com/Alorel/personal-build-tools/commit/53c1439))
* **config:** Defaults to .alobuild.yml ([25c743b](https://github.com/Alorel/personal-build-tools/commit/25c743b))


### Maintenance

* **package:** Add typings ([35adea1](https://github.com/Alorel/personal-build-tools/commit/35adea1))
* **package:** Drop Node 6 support ([ab77e8e](https://github.com/Alorel/personal-build-tools/commit/ab77e8e))


### Refactoring

* Output now wraps at terminal width ([26d930a](https://github.com/Alorel/personal-build-tools/commit/26d930a))


### BREAKING CHANGES

* **package:** Drop Node 6 support
* Config options can no longer be specified in the root

# 1.0.0 (2018-08-22)


### Features

* Initial release ([#1](https://github.com/Alorel/personal-build-tools/issues/1)) ([096593e](https://github.com/Alorel/personal-build-tools/commit/096593e))
