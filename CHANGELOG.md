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
