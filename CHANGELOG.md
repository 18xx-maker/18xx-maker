# Changelog

## [1.0.0-beta.101](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.100...v1.0.0-beta.101) (2024-11-27)


### :tada: Features

* **analytics:** add self hosted plausible analytics ([#630](https://github.com/18xx-maker/18xx-maker/issues/630)) ([7f3540b](https://github.com/18xx-maker/18xx-maker/commit/7f3540b45bac054d8730fc45e2f7b4dea9c88c41)), closes [#625](https://github.com/18xx-maker/18xx-maker/issues/625)


### :bug: Bug Fixes

* **analytics:** adding connect-src to CSP ([#631](https://github.com/18xx-maker/18xx-maker/issues/631)) ([083cd1b](https://github.com/18xx-maker/18xx-maker/commit/083cd1b12948f3b3971e4cea5cc0f68372eac79b))
* **state:** fix the ability for the site to remember your loaded game ([#628](https://github.com/18xx-maker/18xx-maker/issues/628)) ([6a1867e](https://github.com/18xx-maker/18xx-maker/commit/6a1867ec113d57b72941b33c4bf336a3f91ee5d1))

## [1.0.0-beta.100](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.99...v1.0.0-beta.100) (2024-11-27)


### :bug: Bug Fixes

* **colors:** update to latest cube 4 me colors ([#622](https://github.com/18xx-maker/18xx-maker/issues/622)) ([0c34862](https://github.com/18xx-maker/18xx-maker/commit/0c34862b87fd3ee5cd47719158ef5b1d59064ed3)), closes [#487](https://github.com/18xx-maker/18xx-maker/issues/487)
* **elements:** improve tiles page to show more tiles and not error ([#617](https://github.com/18xx-maker/18xx-maker/issues/617)) ([049bef2](https://github.com/18xx-maker/18xx-maker/commit/049bef2f88cfdb8391f95e74e98391a2efb02c12)), closes [#378](https://github.com/18xx-maker/18xx-maker/issues/378)
* scrollbar visible while printing token pages and tile manifests ([#624](https://github.com/18xx-maker/18xx-maker/issues/624)) ([ba8d948](https://github.com/18xx-maker/18xx-maker/commit/ba8d948cd246c88fffb6cc588a90b2727e1d7ba0))
* tiles 638 and 642 values to 70 ([#479](https://github.com/18xx-maker/18xx-maker/issues/479)) ([#621](https://github.com/18xx-maker/18xx-maker/issues/621)) ([dd574bf](https://github.com/18xx-maker/18xx-maker/commit/dd574bf53c84b45d9344a7b9ad1a9fe1d6924724))


### :broom: Chores

* lots of file layout changes and fixes ([#627](https://github.com/18xx-maker/18xx-maker/issues/627)) ([7c25435](https://github.com/18xx-maker/18xx-maker/commit/7c25435866b7b8836e1c3e673a9f35dd3dd11c8e))


### :book: Documentation

* **coc:** create CODE_OF_CONDUCT.md ([#619](https://github.com/18xx-maker/18xx-maker/issues/619)) ([35cbece](https://github.com/18xx-maker/18xx-maker/commit/35cbece20abbfa5d6aca3e57bf6d111361a102f0))
* **home:** updating homepage to reference open source projects ([#620](https://github.com/18xx-maker/18xx-maker/issues/620)) ([cd29273](https://github.com/18xx-maker/18xx-maker/commit/cd292735e88258e3405e17a416010f06a2ed0de6))

## [1.0.0-beta.99](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.98...v1.0.0-beta.99) (2024-11-26)


### :bug: Bug Fixes

* **docker:** update docker images to enable pnpm ([#611](https://github.com/18xx-maker/18xx-maker/issues/611)) ([f4ccaee](https://github.com/18xx-maker/18xx-maker/commit/f4ccaee0ca73f33c73085e130736272577895c54))


### :traffic_light: Tests

* **state:** add testing for the storage adapator ([#616](https://github.com/18xx-maker/18xx-maker/issues/616)) ([6f72ea5](https://github.com/18xx-maker/18xx-maker/commit/6f72ea5213c097a23aee43d9461c0150edd6f595))
* **vitest:** removing the ui from pnpm test ([#614](https://github.com/18xx-maker/18xx-maker/issues/614)) ([9e56d0a](https://github.com/18xx-maker/18xx-maker/commit/9e56d0a33bdeba555d2002b6c31170e5dff95dce))


### :package: Build System

* **electron:** cleaning up electron build ([#612](https://github.com/18xx-maker/18xx-maker/issues/612)) ([d72ed84](https://github.com/18xx-maker/18xx-maker/commit/d72ed848a6c53a58a31e5786fae2332390dbacf7))


### :octocat: Continuous Integration

* **actions:** renable running test.yml on merge queues in case ([#613](https://github.com/18xx-maker/18xx-maker/issues/613)) ([cbd7aff](https://github.com/18xx-maker/18xx-maker/commit/cbd7aff6906c1c33475a73e2f684fe04bc3b6c09))

## [1.0.0-beta.98](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.97...v1.0.0-beta.98) (2024-11-26)


### :broom: Chores

* **deps:** pnpm update ([#606](https://github.com/18xx-maker/18xx-maker/issues/606)) ([81f9e3b](https://github.com/18xx-maker/18xx-maker/commit/81f9e3bf59e21bee213597f841c21a303ecfa412))
* **imports:** move to absolute imports everywhere ([#609](https://github.com/18xx-maker/18xx-maker/issues/609)) ([2162627](https://github.com/18xx-maker/18xx-maker/commit/2162627531b5819f11bc3ed6574a44f1f622a7d5))


### :book: Documentation

* **readme:** adding developer information ([#608](https://github.com/18xx-maker/18xx-maker/issues/608)) ([1debb15](https://github.com/18xx-maker/18xx-maker/commit/1debb150d2fe94439544bfc067d57c6977aede6c))


### :traffic_light: Tests

* **cleanup:** simplifying tests until I'm ready to go bigger ([1debb15](https://github.com/18xx-maker/18xx-maker/commit/1debb150d2fe94439544bfc067d57c6977aede6c))


### :package: Build System

* **app:** clean up electron build ([1debb15](https://github.com/18xx-maker/18xx-maker/commit/1debb150d2fe94439544bfc067d57c6977aede6c))


### :octocat: Continuous Integration

* **storybook:** add storybook to build CI job ([#610](https://github.com/18xx-maker/18xx-maker/issues/610)) ([d684496](https://github.com/18xx-maker/18xx-maker/commit/d684496f3d4da97e2934e575e1b9861876db10d1))

## [1.0.0-beta.97](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.96...v1.0.0-beta.97) (2024-11-26)


### :tada: Features

* replace svg masks with clipPaths ([#593](https://github.com/18xx-maker/18xx-maker/issues/593)) ([4132876](https://github.com/18xx-maker/18xx-maker/commit/4132876a26858ad8792f17bd0c61a3ebf3b28b47))


### :broom: Chores

* migrate from yarn to pnpm ([#595](https://github.com/18xx-maker/18xx-maker/issues/595)) ([e7ef691](https://github.com/18xx-maker/18xx-maker/commit/e7ef691a635f29fab891bd01ab44bc8a719c1899))
* remove unused font context ([#599](https://github.com/18xx-maker/18xx-maker/issues/599)) ([b50adf0](https://github.com/18xx-maker/18xx-maker/commit/b50adf00f995a7752325dc9121071fdf4c2b16e3))


### :package: Build System

* **deps:** bump cross-spawn from 6.0.5 to 6.0.6 in the npm_and_yarn group ([#600](https://github.com/18xx-maker/18xx-maker/issues/600)) ([601aba6](https://github.com/18xx-maker/18xx-maker/commit/601aba6a37ea4b5d8c498f80671f34beda6e8f0b))


### :octocat: Continuous Integration

* allow prettier to ignore pnpm-lock.yaml ([#601](https://github.com/18xx-maker/18xx-maker/issues/601)) ([e18c96e](https://github.com/18xx-maker/18xx-maker/commit/e18c96e82b9201a345a5dcf4e119c945a0a3875d))
* always run commitlint on latest commit ([#605](https://github.com/18xx-maker/18xx-maker/issues/605)) ([67a5525](https://github.com/18xx-maker/18xx-maker/commit/67a55250d2875ec2c7c377ebf5810bcccfdfe898))
* move all linting to a separate task ([#602](https://github.com/18xx-maker/18xx-maker/issues/602)) ([af050d1](https://github.com/18xx-maker/18xx-maker/commit/af050d14d562b0df930b585aada06ee48b96a9ec))
* run test.yaml on main pushes ([#603](https://github.com/18xx-maker/18xx-maker/issues/603)) ([3f53aa6](https://github.com/18xx-maker/18xx-maker/commit/3f53aa624cdc81bbfe2e7be88a3cb9aba9c42618))
* turn off some linting rules to allow dependabot to work ([#604](https://github.com/18xx-maker/18xx-maker/issues/604)) ([970d083](https://github.com/18xx-maker/18xx-maker/commit/970d083cfc9b8280719264fc65287b4728b93e43))

## [1.0.0-beta.96](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.95...v1.0.0-beta.96) (2024-11-25)


### :tada: Features

* add ability to check for updates in the app ([#591](https://github.com/18xx-maker/18xx-maker/issues/591)) ([333c05b](https://github.com/18xx-maker/18xx-maker/commit/333c05b363eaaeabd0fa3d47f11ab6efd9bb0a3a))
* updating 1858 to latest version from Ian ([#592](https://github.com/18xx-maker/18xx-maker/issues/592)) ([8f63cd8](https://github.com/18xx-maker/18xx-maker/commit/8f63cd8f18480ec2cab0d9085ff7ed9904ace98e))


### :bug: Bug Fixes

* **electron:** clean the summary list on loading ([#589](https://github.com/18xx-maker/18xx-maker/issues/589)) ([8749585](https://github.com/18xx-maker/18xx-maker/commit/874958521fde20a5cf26b89c9576cdac30a4d6e3))

## [1.0.0-beta.95](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.94...v1.0.0-beta.95) (2024-11-25)


### :bug: Bug Fixes

* use node:path.basename to load ID ([#585](https://github.com/18xx-maker/18xx-maker/issues/585)) ([42b8b8f](https://github.com/18xx-maker/18xx-maker/commit/42b8b8f9153b4729deabd89ec5c3c798c44353e6))


### :traffic_light: Tests

* move to playwright for jsx tests ([#586](https://github.com/18xx-maker/18xx-maker/issues/586)) ([7decf7e](https://github.com/18xx-maker/18xx-maker/commit/7decf7ef2d7c6eb74555ec12b3171ff5e5899466))


### :package: Build System

* adding docker cache to build workflow ([#584](https://github.com/18xx-maker/18xx-maker/issues/584)) ([8707fa6](https://github.com/18xx-maker/18xx-maker/commit/8707fa69bb9d5ff588ef1452b225e0321e740ee8))
* attempt to fix ghcr display by removing manifest annotations ([#582](https://github.com/18xx-maker/18xx-maker/issues/582)) ([99ea4ab](https://github.com/18xx-maker/18xx-maker/commit/99ea4abb29f92ae635eeeae57087edf4327095cb))

## [1.0.0-beta.94](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.93...v1.0.0-beta.94) (2024-11-25)


### :package: Build System

* set annotations at the index level as well as manifest ([#580](https://github.com/18xx-maker/18xx-maker/issues/580)) ([d27094a](https://github.com/18xx-maker/18xx-maker/commit/d27094aa739a4fb7c73cc751ecb7e40474f60d57))


### :octocat: Continuous Integration

* do not run tests again on main branch ([#579](https://github.com/18xx-maker/18xx-maker/issues/579)) ([d29a0fc](https://github.com/18xx-maker/18xx-maker/commit/d29a0fcce7cc8bf8bb253e656b78bd7d40c12ac7))

## [1.0.0-beta.93](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.92...v1.0.0-beta.93) (2024-11-25)


### :package: Build System

* add explicit title update to docker annotations ([#578](https://github.com/18xx-maker/18xx-maker/issues/578)) ([81ac2ad](https://github.com/18xx-maker/18xx-maker/commit/81ac2adfe09f403ec94795f591897c98258d8de6))
* make sure electron-builder does not publish ([#576](https://github.com/18xx-maker/18xx-maker/issues/576)) ([86fa3c2](https://github.com/18xx-maker/18xx-maker/commit/86fa3c2cbdf195fadcb7e3db4b660df447549464))


### :octocat: Continuous Integration

* fix the artifact paths in the app workflow ([#575](https://github.com/18xx-maker/18xx-maker/issues/575)) ([a1da73b](https://github.com/18xx-maker/18xx-maker/commit/a1da73bff5352233ddcd4eceb98fbc8d5be4dc47))

## [1.0.0-beta.92](https://github.com/18xx-maker/18xx-maker/compare/v1.0.0-beta.91...v1.0.0-beta.92) (2024-11-25)


### :sheep: Reverts

* will test docker builds without extra annotation config ([#574](https://github.com/18xx-maker/18xx-maker/issues/574)) ([5832deb](https://github.com/18xx-maker/18xx-maker/commit/5832deb64868303b9b335b7917792e9c0a1550b3))


### :package: Build System

* add annotations to build action ([#573](https://github.com/18xx-maker/18xx-maker/issues/573)) ([5a56067](https://github.com/18xx-maker/18xx-maker/commit/5a560671bd0c9acc5c0019b4edfd6c4ef36021bc))
* attempt to add better annotations to the docker images ([#571](https://github.com/18xx-maker/18xx-maker/issues/571)) ([5bafd4b](https://github.com/18xx-maker/18xx-maker/commit/5bafd4ba768b7f0476afead75195cb6c44832e25))


### :octocat: Continuous Integration

* do not upload docker build records to github ([#572](https://github.com/18xx-maker/18xx-maker/issues/572)) ([6ce3198](https://github.com/18xx-maker/18xx-maker/commit/6ce3198298f909dc9e9a86751d870de49bea44ce))
* only run commitlint on PRs ([#568](https://github.com/18xx-maker/18xx-maker/issues/568)) ([3f9c320](https://github.com/18xx-maker/18xx-maker/commit/3f9c320cf7818194bed2908c988bd42e626c396c))
* properly quote artifact files for gh release ([#569](https://github.com/18xx-maker/18xx-maker/issues/569)) ([9f4e8da](https://github.com/18xx-maker/18xx-maker/commit/9f4e8da0678fdda21857659e5af31aae42858839))

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
