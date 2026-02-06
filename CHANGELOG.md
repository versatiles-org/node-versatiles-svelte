# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

