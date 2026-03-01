# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

