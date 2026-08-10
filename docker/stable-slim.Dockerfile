# Must match the installed playwright version, otherwise the prebuilt browsers are missing.
# test_playwright.sh passes the version of the locally installed playwright.
ARG PLAYWRIGHT_VERSION=1.62.1
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble
WORKDIR /code
COPY docker/xvfb-startup.sh /usr/local/bin/xvfb-startup.sh
RUN chmod +x /usr/local/bin/xvfb-startup.sh
COPY package.json package-lock.json ./
RUN npm ci
COPY *.ts *.js *.json ./
# `npm run build` bundles the MapLibre worker via scripts/bundle_worker.ts
COPY scripts ./scripts
ENTRYPOINT ["/usr/local/bin/xvfb-startup.sh"]
