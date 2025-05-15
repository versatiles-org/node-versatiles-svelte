#!/bin/bash
set -e
cd "$(dirname "$0")/.."

docker build . -t playwright-tests -f docker/stable-slim.Dockerfile
docker run -v $(pwd)/src:/code/src -v $(pwd)/static:/code/static -v $(pwd)/playwright-tests:/code/playwright-tests -v $(pwd)/test-results:/code/test-results --ipc=host --rm playwright-tests /bin/bash -c "npx playwright test"
