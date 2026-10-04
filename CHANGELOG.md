# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.2] - 2026-10-04

### Bug Fixes

- update dependabot configuration to ignore TypeScript major version updates ([6536a0e](https://github.com/versatiles-org/node-versatiles-svelte/commit/6536a0ee411e89c0731804df3acbd8dc7548e506))
- enhance MapLibre worker script to handle dynamic imports correctly ([0bd5f83](https://github.com/versatiles-org/node-versatiles-svelte/commit/0bd5f834843abba33f6b646b238c09e4e6512af4))
- update Playwright version retrieval in CI workflow ([a5327dc](https://github.com/versatiles-org/node-versatiles-svelte/commit/a5327dc64bb33904cdd8ff1a600b9b004836d456))

### Code Refactoring

- map assets and update tests ([802846b](https://github.com/versatiles-org/node-versatiles-svelte/commit/802846ba37ee0fbb5f85855831349c92d3f159a6))

### Chores

- add security update groups for GitHub Actions and npm in dependabot configuration ([5b881e9](https://github.com/versatiles-org/node-versatiles-svelte/commit/5b881e9e1e21dbc6068fefe1e5941e38c2007b33))
- update dependencies to latest versions ([074e234](https://github.com/versatiles-org/node-versatiles-svelte/commit/074e234f34bea40a426fc4516c8783f0c2ee3036))

## [2.3.1] - 2026-08-10

### Features

- bundle MapLibre worker and update references in BasicMap component ([abbce0f](https://github.com/versatiles-org/node-versatiles-svelte/commit/abbce0f980136ba4b4115bbee8b59efb8b5fe771))

## [2.3.0] - 2026-08-10

### Features

- add Docker package ecosystem to dependabot configuration ([1493aae](https://github.com/versatiles-org/node-versatiles-svelte/commit/1493aaef61a1dc2c0359aaff191b5064927b318c))
- add @maplibre/maplibre-gl-style-spec dependency and update imports to use namespace imports for maplibre-gl ([660d743](https://github.com/versatiles-org/node-versatiles-svelte/commit/660d743c759d1608747ea148dbbab490c6dab60f))
- update Dockerfile and test script to use dynamic Playwright version ([f22e4b0](https://github.com/versatiles-org/node-versatiles-svelte/commit/f22e4b0673303e647fcd629b669f3576dedd3fb1))

### Bug Fixes

- update Dockerfile to use Playwright base image and remove unnecessary dependencies ([e44fd92](https://github.com/versatiles-org/node-versatiles-svelte/commit/e44fd928f443e710a2004659bfd822fefe22aec3))
- update test configuration to include coverage settings and environment ([40cc292](https://github.com/versatiles-org/node-versatiles-svelte/commit/40cc2924f0de92f3b67f1999100aee8f0367e11c))
- set MapLibre worker URL explicitly for proper bundling ([47558ae](https://github.com/versatiles-org/node-versatiles-svelte/commit/47558ae1ff17db9ce48a982f9e90e8c5408a1066))
- prevent memory leaks by ensuring BBoxDrawer is not used after component destruction, close #88 ([8fe3c1b](https://github.com/versatiles-org/node-versatiles-svelte/commit/8fe3c1b749b66637fc3ca532ff434f3227b540da))
- add repository metadata to package.json ([de47a1d](https://github.com/versatiles-org/node-versatiles-svelte/commit/de47a1d146625f05f48c671c49aab848ee8aee44))

### Code Refactoring

- remove esbuild top-level await support from vite configuration ([524acf9](https://github.com/versatiles-org/node-versatiles-svelte/commit/524acf98bd9810c1821c5b4288c3f7e753061864))
- streamline Dockerfile and xvfb startup script, update test script for consistency ([82c3a1f](https://github.com/versatiles-org/node-versatiles-svelte/commit/82c3a1f5a0b3ecda3d53a1db76c7a5730bb61319))
- migrate styles from SCSS to CSS, update dependencies, and clean up configuration ([b648a1e](https://github.com/versatiles-org/node-versatiles-svelte/commit/b648a1efa528d4c200c5087d37ff7efb261cabb0))

### Tests

- add missing glyphs for bbox-map and map-editor tests ([c19b9a9](https://github.com/versatiles-org/node-versatiles-svelte/commit/c19b9a93e9ff13ed593efb81daae6a21e7a225f2))
- add test for bbox rendering during slow style loading ([5f40778](https://github.com/versatiles-org/node-versatiles-svelte/commit/5f40778136395629e177bd442638e3cb7df81238))
- update snapshot images for Playwright tests across multiple browsers ([616a3c9](https://github.com/versatiles-org/node-versatiles-svelte/commit/616a3c90ac6cd7e11083e6e9921402007ea7d771))

### Build System

- **deps:** bump the action group across 1 directory with 7 updates ([7c0a250](https://github.com/versatiles-org/node-versatiles-svelte/commit/7c0a25065b2eda48e14ee6be244d1c1521224d0e))
- **deps:** bump the action group across 1 directory with 4 updates ([5f4635b](https://github.com/versatiles-org/node-versatiles-svelte/commit/5f4635b2e679c336ddb42211103c39973ea008d4))

### Chores

- update dependencies to latest versions ([440912b](https://github.com/versatiles-org/node-versatiles-svelte/commit/440912b935b810b3bb8199cd3c60a3a012ec2e7c))
- update dependencies to latest versions in package.json and package-lock.json ([0257cdd](https://github.com/versatiles-org/node-versatiles-svelte/commit/0257cdd54e73aa7dedbaa4592bfd4154242d4056))
- update cookie dependency to version 0.7.2 and add overrides in package.json ([b4d8685](https://github.com/versatiles-org/node-versatiles-svelte/commit/b4d86859c0681d0bae63c65cf26cd7bae0029f25))
- update funding information in FUNDING.yml ([5d7f727](https://github.com/versatiles-org/node-versatiles-svelte/commit/5d7f727f1e7f72280f407e325768e674e168f8c2))
- update dependencies and devDependencies in package.json ([98f6657](https://github.com/versatiles-org/node-versatiles-svelte/commit/98f66576477cf326233f6e1b065e38c730735116))

### Styles

- format types ([afeb3d8](https://github.com/versatiles-org/node-versatiles-svelte/commit/afeb3d85dccb218b9d3fc4fe8b95578df5a0f0d7))

## [2.2.2] - 2026-03-01

### Features

- add TypeScript configuration file for project setup

### Bug Fixes

- update badge labels in README.md for consistency
- add @eslint/js and playwright to devDependencies
- remove unused dependencies from package.json and package-lock.json
- initialize result array as undefined for later assignment
- update @versatiles/release-tool to version 2.7.4 and remove deprecated mdast dependency

### Chores

- **deps:** update dependencies to latest versions

## [2.2.1] - 2026-02-15

### Bug Fixes

- update .prettierignore to include CHANGELOG.md
- consolidate test configuration into vite.config.ts and remove vitest.config.ts
- update cursor style for invalid drag point in BBoxDrawer

### Chores

- update dependencies to latest versions

## [2.2.0] - 2026-02-06

### Features

- add button to select visible area as bounding box and improve toolbar layout
- implement request caching mechanism in setupRequestCache function

### Bug Fixes

- correct zoom calculation in BBoxMap component
- update tile references and adjust screenshot check in bbox-map tests
- correct flipH value for 'ne' drag point in DragPointMap
- prevent unnecessary dragEnd event emission when not dragging
- add cleanup logic to BBoxDrawer on component destruction
- refactor BBoxDrawer to use consistent layer IDs and improve event handling
- update svelte:window event binding syntax
- update input selection range logic and add role attribute to autocomplete results
- adjust bounding box selection logic and improve zoom padding
- add .request-cache directory to .gitignore
- update import statements to use local test module

### Tests

- update bbox-map tests
- add tests for selecting visible area and bbox drag functionality

### Chores

- update dependencies to latest versions

