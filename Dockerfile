FROM node:10-slim as build

# Install latest chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /src/*.deb

RUN groupadd -r 18xx && useradd -r -g 18xx -G audio,video 18xx \
  && mkdir -p /home/18xx/Downloads \
  && chown -R 18xx:18xx /home/18xx

USER 18xx
WORKDIR /home/18xx

# Install Deps
COPY package.json /home/18xx/
COPY yarn.lock /home/18xx
RUN yarn

# Build site
COPY . /home/18xx
RUN yarn build

FROM nginx:1.15.10-alpine
LABEL maintainer="kelsin@valefor.com"
WORKDIR /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /home/18xx/build /usr/share/nginx/html
