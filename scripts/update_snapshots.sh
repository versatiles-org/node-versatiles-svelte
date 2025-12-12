#!/bin/bash
set -e
cd "$(dirname "$0")/.."

docker build . -t playwright-tests -f docker/stable-slim.Dockerfile
docker run \
  -v $(pwd)/src:/code/src \
  -v $(pwd)/static:/code/static \
  -v $(pwd)/playwright-tests:/code/playwright-tests \
  -v $(pwd)/test-results:/code/test-results \
  --ipc=host --rm playwright-tests \
  /bin/bash -c "npx playwright test --update-snapshots all"

# --cache-from type=gha
# --cache-to type=gha,mode=max

# npm i
# npx playwright test --update-snapshots patch
