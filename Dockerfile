FROM node:22-slim AS build

COPY package.json /home/18xx/
COPY yarn.lock /home/18xx

WORKDIR /home/18xx

# Install Deps
RUN yarn

# Build site
COPY . /home/18xx
RUN yarn build

RUN groupadd -r 18xx && useradd -r -g 18xx -G audio,video 18xx \
  && mkdir -p /home/18xx/Downloads \
  && chown -R 18xx:18xx /home/18xx

USER 18xx

FROM nginx:alpine
LABEL maintainer="kelsin@valefor.com"
WORKDIR /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /home/18xx/dist /usr/share/nginx/html
