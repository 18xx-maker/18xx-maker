# Changelog

## [1.0.0-beta.91](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.90...v1.0.0-beta.91) (2024-11-25)


### :book: Documentation

* add links to ghcr.io docker repositories to developing docs ([#566](https://github.com/18xx-maker/18xx-maker/issues/566)) ([c2020f0](https://github.com/18xx-maker/18xx-maker/commit/c2020f03a6baeaeab6833ee815efd9699cbde293))
* update docker link in readme ([#567](https://github.com/18xx-maker/18xx-maker/issues/567)) ([12a6e05](https://github.com/18xx-maker/18xx-maker/commit/12a6e0516b7b7dcbc6d31d0b15721f214818544c))


### :package: Build System

* fix docker latest tags and better image title ([#564](https://github.com/18xx-maker/18xx-maker/issues/564)) ([f894a3b](https://github.com/18xx-maker/18xx-maker/commit/f894a3b12dab5b77c306f7e9f002627c2d86fed3))


### :octocat: Continuous Integration

* fix the variable that we write our artifacts to ([#563](https://github.com/18xx-maker/18xx-maker/issues/563)) ([577a94e](https://github.com/18xx-maker/18xx-maker/commit/577a94e9893e5b697e8287cfd719381b7ce69d98))

## [1.0.0-beta.90](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.89...v1.0.0-beta.90) (2024-11-25)


### :octocat: Continuous Integration

* add summaries for the test jobs ([#561](https://github.com/18xx-maker/18xx-maker/issues/561)) ([83ac5f0](https://github.com/18xx-maker/18xx-maker/commit/83ac5f0daf8581f8545192f00f3a74e273978d27))
* better release tagging and set prerelease to true ([83ac5f0](https://github.com/18xx-maker/18xx-maker/commit/83ac5f0daf8581f8545192f00f3a74e273978d27))
* cleaner release title ([83ac5f0](https://github.com/18xx-maker/18xx-maker/commit/83ac5f0daf8581f8545192f00f3a74e273978d27))
* fix issues in docker, app and release jobs ([#560](https://github.com/18xx-maker/18xx-maker/issues/560)) ([f042324](https://github.com/18xx-maker/18xx-maker/commit/f042324dce72494fd5c23dffb7dca2b08c096c12))
* fix windows summary ([83ac5f0](https://github.com/18xx-maker/18xx-maker/commit/83ac5f0daf8581f8545192f00f3a74e273978d27))

## [1.0.0-beta.89](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.88...v1.0.0-beta.89) (2024-11-25)


### :tada: Features

* adding code highlighting to all relevant places ([#545](https://github.com/18xx-maker/18xx-maker/issues/545)) ([d0037e0](https://github.com/18xx-maker/18xx-maker/commit/d0037e0ec97816597b33adeae8c5cfab76dc5c54))
* move to playwright and docker improvements ([#544](https://github.com/18xx-maker/18xx-maker/issues/544)) ([271d5bd](https://github.com/18xx-maker/18xx-maker/commit/271d5bd17860af40dc7d4f108477dcaffc2af0fe))
* upgrade to react-router 7 ([#548](https://github.com/18xx-maker/18xx-maker/issues/548)) ([74dbe1f](https://github.com/18xx-maker/18xx-maker/commit/74dbe1f86d922a73836386fe5cd4d5757b55475d))


### :bug: Bug Fixes

* add new paths to prettierignore ([#553](https://github.com/18xx-maker/18xx-maker/issues/553)) ([ff4cb86](https://github.com/18xx-maker/18xx-maker/commit/ff4cb86c01a9ebc95de4b77c7f1e69ead32ae4b5))
* adding venmo link ([#546](https://github.com/18xx-maker/18xx-maker/issues/546)) ([ce472b0](https://github.com/18xx-maker/18xx-maker/commit/ce472b0b23a4c7f95073b8e9664f379f30690f19))


### :broom: Chores

* add playwright link to readme ([#549](https://github.com/18xx-maker/18xx-maker/issues/549)) ([c46eb55](https://github.com/18xx-maker/18xx-maker/commit/c46eb55307bc8017b27cb174bf5194c543185ef1))
* better docker readme ([#550](https://github.com/18xx-maker/18xx-maker/issues/550)) ([5132d2e](https://github.com/18xx-maker/18xx-maker/commit/5132d2e38222719b8fe92fa4355958229f71596c))
* bootstrap releases ([#554](https://github.com/18xx-maker/18xx-maker/issues/554)) ([cb63fc2](https://github.com/18xx-maker/18xx-maker/commit/cb63fc20bd18c35af439fcdc1fe81f5ca0def7d8))
* fix up the developing page links ([#547](https://github.com/18xx-maker/18xx-maker/issues/547)) ([56f2009](https://github.com/18xx-maker/18xx-maker/commit/56f20092002db6c1ccec2a57943c529c378e4759))
* improve releases ([#551](https://github.com/18xx-maker/18xx-maker/issues/551)) ([7f7d9f3](https://github.com/18xx-maker/18xx-maker/commit/7f7d9f312f5610ac70b4c284a42a25ce270d86e0))
* multi-platform docker images ([158a0c0](https://github.com/18xx-maker/18xx-maker/commit/158a0c0d754b840c1703a099641a0fbce8a3d5c5))
* refactor workflow ([#556](https://github.com/18xx-maker/18xx-maker/issues/556)) ([20df9c0](https://github.com/18xx-maker/18xx-maker/commit/20df9c0abec516080de4e2a3e5195f3babd3450c))
* remove codecov and codeclimate ([#555](https://github.com/18xx-maker/18xx-maker/issues/555)) ([9fb7513](https://github.com/18xx-maker/18xx-maker/commit/9fb7513e2e33fd95bb4c3f48d6e0ff2522b77485))
* update workflow name on github badge ([#558](https://github.com/18xx-maker/18xx-maker/issues/558)) ([2e76f16](https://github.com/18xx-maker/18xx-maker/commit/2e76f16c3e6c75bf5f6bc7a21ca665daa29808c2))


### :package: Build System

* rework how docker images are laid out ([#559](https://github.com/18xx-maker/18xx-maker/issues/559)) ([92efbdb](https://github.com/18xx-maker/18xx-maker/commit/92efbdb1629963d35712e3e0e78e5ef6c54671c1))


### :octocat: Continuous Integration

* changelog updates ([#557](https://github.com/18xx-maker/18xx-maker/issues/557)) ([760720b](https://github.com/18xx-maker/18xx-maker/commit/760720bb41f71b987dfbf424ca69a00ded554a4c))
