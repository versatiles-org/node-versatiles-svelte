# Thanks to https://github.com/bengreenier/docker-xvfb/blob/master/docker/stable-slim.Dockerfile
FROM node:24-slim
WORKDIR /usr/bin
RUN apt-get update -y \
  && apt-get install --no-install-recommends -y xvfb libgl1-mesa-dri \
  && rm -rf /var/lib/apt/lists/*
COPY docker/xvfb-startup.sh .
RUN sed -i 's/\r$//' xvfb-startup.sh
ARG RESOLUTION="1920x1080x24"
ENV XVFB_RES="${RESOLUTION}"
ARG XARGS=""
ENV XVFB_ARGS="${XARGS}"
WORKDIR /code
COPY *.json *.ts *.js .
RUN npm i
RUN npx playwright install-deps
RUN npx playwright install
ENTRYPOINT ["/bin/bash", "/usr/bin/xvfb-startup.sh"]
