FROM node:22-slim AS build

RUN mkdir -p /18xx
WORKDIR /18xx

COPY package.json /18xx/
COPY yarn.lock /18xx

# Install Deps
RUN yarn

# Build site
COPY . /18xx
RUN yarn build

FROM nginx:alpine
LABEL maintainer="kelsin@valefor.com"
WORKDIR /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /18xx/dist /usr/share/nginx/html
