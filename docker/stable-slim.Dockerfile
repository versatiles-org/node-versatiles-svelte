FROM mcr.microsoft.com/playwright:v1.60.0-noble
WORKDIR /usr/bin
COPY docker/xvfb-startup.sh .
RUN sed -i 's/\r$//' xvfb-startup.sh
ARG RESOLUTION="1920x1080x24"
ENV XVFB_RES="${RESOLUTION}"
ARG XARGS=""
ENV XVFB_ARGS="${XARGS}"
WORKDIR /code
COPY package.json package-lock.json ./
RUN npm i
COPY *.ts *.js *.json ./
ENTRYPOINT ["/bin/bash", "/usr/bin/xvfb-startup.sh"]
