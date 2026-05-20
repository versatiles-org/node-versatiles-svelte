FROM mcr.microsoft.com/playwright:v1.60.0-noble
WORKDIR /code
COPY docker/xvfb-startup.sh /usr/local/bin/xvfb-startup.sh
RUN chmod +x /usr/local/bin/xvfb-startup.sh
COPY package.json package-lock.json ./
RUN npm ci
COPY *.ts *.js *.json ./
ENTRYPOINT ["/usr/local/bin/xvfb-startup.sh"]
