# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.4.7](https://github.com/clowdhaus/aws-github-actions/compare/v0.4.6...v0.4.7) (2020-09-13)

**Note:** Version bump only for package aws-github-actions





## [0.4.6](https://github.com/clowdhaus/aws-github-actions/compare/v0.4.5...v0.4.6) (2020-08-01)

**Note:** Version bump only for package aws-github-actions





## [0.4.5](https://github.com/clowdhaus/aws-github-actions/compare/v0.4.4...v0.4.5) (2020-07-20)

**Note:** Version bump only for package aws-github-actions





## [0.4.4](https://github.com/clowdhaus/aws-github-actions/compare/v0.4.3...v0.4.4) (2020-06-21)


### Bug Fixes

* fix actions on windows runners ([#6](https://github.com/clowdhaus/aws-github-actions/issues/6)) ([e7aac78](https://github.com/clowdhaus/aws-github-actions/commit/e7aac783e5d267e08234ee71bfbf42c966e3d0f2))


### Features

* add additional os testing with matrix strategy for all but cloudfront invalidation ([#5](https://github.com/clowdhaus/aws-github-actions/issues/5)) ([072d6ee](https://github.com/clowdhaus/aws-github-actions/commit/072d6eeae502e94883d3b24e7b809584ecccbb42))





## [0.4.3](https://github.com/clowdhaus/aws-github-actions/compare/v0.4.2...v0.4.3) (2020-06-21)

**Note:** Version bump only for package aws-github-actions





## [0.4.2](https://github.com/clowdhaus/aws-github-actions/compare/v0.4.1...v0.4.2) (2020-05-25)

**Note:** Version bump only for package aws-github-actions





## [0.4.1](https://github.com/clowdhaus/aws-github-actions/compare/v0.4.0...v0.4.1) (2020-05-02)

**Note:** Version bump only for package aws-github-actions





# [0.4.0](https://github.com/clowdhaus/aws-github-actions/compare/v0.3.0...v0.4.0) (2020-04-24)


### Features

* **awscli:** upgrade awscli to v2 ([320481c](https://github.com/clowdhaus/aws-github-actions/commit/320481c27b2d6c9a26760a0fab75ad5222d39182))





# 0.3.0 (2020-04-06)


### Bug Fixes

* fix action path name for monorepo, bump dependencies and recompile ([6d6641c](https://github.com/clowdhaus/aws-github-actions/commit/6d6641ccba42395326c28a2f884ac4d06a375384))


### Features

* **all:** initial commit starting off project with base setup of yarn workspaces, lerna, and ncc ([3f2904a](https://github.com/clowdhaus/aws-github-actions/commit/3f2904a44bc130d2e002b93b45a725d903c991c4))
* **awscli:** make awscli internal package into an action as well, general purpose use of the awscli ([f5f6b5a](https://github.com/clowdhaus/aws-github-actions/commit/f5f6b5abef7e73e852221ad86ba23cec0305214d))
* **cloudfront:** initial implementation of CloudFront cache invalidation action ([47f0063](https://github.com/clowdhaus/aws-github-actions/commit/47f0063cc864085f0d5e48548413a09d7788eb71))
* **s3:** break out awscli from S3 sync to stand on its own ([48de053](https://github.com/clowdhaus/aws-github-actions/commit/48de0535480795e9a45af0f4b64ad7ed68c1c46a))
* **s3:** implement S3 sync using awscli cached locally, no support in javascript sdk ([6ea5d6c](https://github.com/clowdhaus/aws-github-actions/commit/6ea5d6c26865e91e524a90dda7b8a126d8fc96cf))
* **sts:** implment action for setting up IAM credentials in workflow environment ([6d69c04](https://github.com/clowdhaus/aws-github-actions/commit/6d69c045cfc277432d791a7100a9a89168f56225))





# 0.2.0 (2020-03-07)


### Bug Fixes

* fix action path name for monorepo, bump dependencies and recompile ([6d6641c](https://github.com/clowdhaus/aws-github-actions/commit/6d6641ccba42395326c28a2f884ac4d06a375384))


### Features

* **all:** initial commit starting off project with base setup of yarn workspaces, lerna, and ncc ([3f2904a](https://github.com/clowdhaus/aws-github-actions/commit/3f2904a44bc130d2e002b93b45a725d903c991c4))
* **awscli:** make awscli internal package into an action as well, general purpose use of the awscli ([f5f6b5a](https://github.com/clowdhaus/aws-github-actions/commit/f5f6b5abef7e73e852221ad86ba23cec0305214d))
* **cloudfront:** initial implementation of CloudFront cache invalidation action ([47f0063](https://github.com/clowdhaus/aws-github-actions/commit/47f0063cc864085f0d5e48548413a09d7788eb71))
* **s3:** break out awscli from S3 sync to stand on its own ([48de053](https://github.com/clowdhaus/aws-github-actions/commit/48de0535480795e9a45af0f4b64ad7ed68c1c46a))
* **s3:** implement S3 sync using awscli cached locally, no support in javascript sdk ([6ea5d6c](https://github.com/clowdhaus/aws-github-actions/commit/6ea5d6c26865e91e524a90dda7b8a126d8fc96cf))
* **sts:** implment action for setting up IAM credentials in workflow environment ([6d69c04](https://github.com/clowdhaus/aws-github-actions/commit/6d69c045cfc277432d791a7100a9a89168f56225))
