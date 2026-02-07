## [3.0.0](https://github.com/rvagg/ghreview/compare/v2.0.4...v3.0.0) (2026-02-07)

### ⚠ BREAKING CHANGES

* only include tracked files in review by default

### Features

* only include tracked files in review by default ([8e20211](https://github.com/rvagg/ghreview/commit/8e20211e48c12ab42e7e170f48478e881930f04d))
* preserve staging state across review cycle ([6fe2429](https://github.com/rvagg/ghreview/commit/6fe242947623fc4fef3f8e75b1bc7b6baaf60463))

## [2.0.4](https://github.com/rvagg/ghreview/compare/v2.0.3...v2.0.4) (2026-02-02)

### Trivial Changes

* **deps-dev:** bump vitest from 4.0.17 to 4.0.18 ([#27](https://github.com/rvagg/ghreview/issues/27)) ([116ab54](https://github.com/rvagg/ghreview/commit/116ab54f511e5f2089b643df9eb8b27150c9a977))

## [2.0.3](https://github.com/rvagg/ghreview/compare/v2.0.2...v2.0.3) (2026-01-27)

### Trivial Changes

* **deps-dev:** bump vitest from 3.2.4 to 4.0.17 ([#24](https://github.com/rvagg/ghreview/issues/24)) ([cc8e2e7](https://github.com/rvagg/ghreview/commit/cc8e2e718f2d8e0cbd130fc662286c34d0e032e4))
* **deps:** bump @octokit/rest from 22.0.0 to 22.0.1 ([#26](https://github.com/rvagg/ghreview/issues/26)) ([24c3e6c](https://github.com/rvagg/ghreview/commit/24c3e6c7d44d2d29785c805f3de93fb3c385427f))
* **deps:** bump simple-git from 3.28.0 to 3.30.0 ([#25](https://github.com/rvagg/ghreview/issues/25)) ([6466058](https://github.com/rvagg/ghreview/commit/64660586c88d67e1c4b9aa0dd6e1687260a0a986))

## [2.0.2](https://github.com/rvagg/ghreview/compare/v2.0.1...v2.0.2) (2026-01-24)

### Trivial Changes

* **deps-dev:** bump @semantic-release/npm from 13.1.1 to 13.1.3 ([#22](https://github.com/rvagg/ghreview/issues/22)) ([af0c667](https://github.com/rvagg/ghreview/commit/af0c667d507344db882452d7d1bdb9db1a2c2d2e))
* **deps:** bump actions/checkout from 6.0.1 to 6.0.2 ([#21](https://github.com/rvagg/ghreview/issues/21)) ([ec1303c](https://github.com/rvagg/ghreview/commit/ec1303c5a5fd3003d08648f0b3933815e94335b6))
* **deps:** bump actions/setup-node from 6.1.0 to 6.2.0 ([#20](https://github.com/rvagg/ghreview/issues/20)) ([55cbebf](https://github.com/rvagg/ghreview/commit/55cbebfff5bab1f5d62bb6013f4ce7910459d66e))

## [2.0.1](https://github.com/rvagg/ghreview/compare/v2.0.0...v2.0.1) (2026-01-24)

### Trivial Changes

* **deps-dev:** bump nock from 14.0.7 to 14.0.10 ([#5](https://github.com/rvagg/ghreview/issues/5)) ([b979aba](https://github.com/rvagg/ghreview/commit/b979abaad70a259a0d01eb6d8b89eeb0a7707dc6))

## [2.0.0](https://github.com/rvagg/ghreview/compare/v1.0.1...v2.0.0) (2026-01-24)

### ⚠ BREAKING CHANGES

* Config location changed from ~/.ghreview/config.json
to XDG paths (~/.config/ghreview/config.json on Linux). Move your
existing config to the new location.

### Features

* add interactive auth and filter resolved comments ([29a8196](https://github.com/rvagg/ghreview/commit/29a81961b5c9ee636552d048f96cc9d59c7ace81))

### Trivial Changes

* **ci:** oidc publishing ([4cef06b](https://github.com/rvagg/ghreview/commit/4cef06b9f64ec067b0363fc230babca74e224395))
* **deps-dev:** bump @semantic-release/github from 11.0.6 to 12.0.0 ([cef9450](https://github.com/rvagg/ghreview/commit/cef94502b1d00ced4c653b67b0af7b6ff350948b))
* **deps-dev:** bump @semantic-release/npm from 12.0.2 to 13.1.1 ([c63e419](https://github.com/rvagg/ghreview/commit/c63e419188b913ed866ddf48b7bbbe4c2d2b8f00))
* **deps-dev:** bump nock from 14.0.7 to 14.0.10 ([a7c98df](https://github.com/rvagg/ghreview/commit/a7c98dfe7840fbd26a5c9c81ed21acd5bfcf7240))
* **deps:** bump actions/checkout from 4.2.2 to 6.0.1 ([170b48c](https://github.com/rvagg/ghreview/commit/170b48c47bfd6a601037d362b9c3b4e084a83d05))
* **deps:** bump actions/setup-node from 4.4.0 to 6.1.0 ([61ce2d9](https://github.com/rvagg/ghreview/commit/61ce2d9f083b83562d139de8bcfba985c9017a4a))
* **deps:** bump chalk from 5.4.1 to 5.6.2 ([948fa9d](https://github.com/rvagg/ghreview/commit/948fa9d78c11b527c4483276e7426b6207084751))
* **deps:** bump ora from 8.2.0 to 9.0.0 ([8dff5ca](https://github.com/rvagg/ghreview/commit/8dff5ca3d61eb056739422b647d8e7c260967924))
* fix dependabot config ([4d2b670](https://github.com/rvagg/ghreview/commit/4d2b670cda6b6c975d760ec822f0ce2ca1b337cd))

## [1.0.1](https://github.com/rvagg/ghreview/compare/v1.0.0...v1.0.1) (2025-07-28)

### Trivial Changes

* bump ([ed0f6d9](https://github.com/rvagg/ghreview/commit/ed0f6d9b16c52566b1238f4b5ccdc362f5660d82))

## 1.0.0 (2025-07-28)

### Bug Fixes

* publish ([b405eb4](https://github.com/rvagg/ghreview/commit/b405eb4cff0d13e856da0aeee895d7601d9f3763))
* update publish perms ([62009ef](https://github.com/rvagg/ghreview/commit/62009ef718d06664efb3ac5a001e5b84fe5364a0))

### Trivial Changes

* **docs:** expand workflow description ([5dd5671](https://github.com/rvagg/ghreview/commit/5dd5671f455dfa83bda88a1f8e0fab2fa9d836af))
* initial release ([2a1891d](https://github.com/rvagg/ghreview/commit/2a1891d9c7661f3bb761a8d2dfa36da1287fcea3))
