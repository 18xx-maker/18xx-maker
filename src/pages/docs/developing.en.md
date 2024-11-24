# Running Locally

**Note:** the easiest way to start using 18xx-maker is by using the [app
version](https://github.com/18xx-maker/18xx-maker/releases). Just download the
app and you're good to load in a game JSON file and start editing using your
favorite JSON editor. These instructions are ONLY if you want to develop on 18xx
Maker itself.

If you have experience with [Docker](https://www.docker.com/) and already have
it installed you can skip to the [Using Docker](#using-docker) section.

## Node.js and Yarn

### Dependencies

First you need to install node.js and yarn.

On a mac I would recommend using the [homebrew package
manager](https://brew.sh/) to do this. Once homebrew is installed (you can
follow directions on their site) you can run:

```sh
brew install yarn
```

This will install [node](https://nodejs.org/) and [yarn](https://yarnpkg.com/)
for you.

You can also install node directly from [their website](https://nodejs.org/) and
yarn using one of their [installation
methods](https://yarnpkg.com/docs/install).

### Getting the site code

This site is stored as a [git](https://git-scm.com/) repository hosted on
[github](https://github.com/). You can use any normal git client to get the
[source code](https://github.com/18xx-maker/18xx-maker). You can also just
download of a [zip file of the latest
code](https://github.com/18xx-maker/18xx-maker/archive/master.zip).

Extract the zip file (or `git clone` the repository) to any directory that you
want.

### Running the site

Once you have the site in a folder, and yarn installed you need to open a
command prompt (on Windows) or a Terminal (on Mac) to the site folder and you
can use the following commands:

```sh
# Install all dependencies
yarn

# Run the development version of the site
yarn start

# Run (and watch) tests
yarn test
```

**Important:** Anytime you update the site's code (from git or from downloading
a new zip) you should run `yarn` again to update your dependencies.

## Using Docker

We publish two docker images to
[dockerhub](https://hub.docker.com/r/kelsin/18xx).

### Production Site

The first is a [nginx](https://hub.docker.com/_/nginx) image with the full
running site the way it appears on [18xx-maker.com](https://18xx-maker.com) and
is available as `kelsin/18xx:latest` or by git tag (something like
`kelsin/18xx:v1.0.0-beta.88`).

You can run this version locally with a command like:

```sh
docker run -it --rm -p 3000:80 --name 18xx kelsin/18xx
```

### Developer Image

The second image is a [node](https://hub.docker.com/_/node) image and contains
the development version of the site that you can run against a local volume to
keep changes. Knowledge of how to manage docker volumes is important to use this
properly. This docker version is capable of running all of the scripts (using
playwright) as well and comes with the headless chromium installed. This version
is available as `kelsin/18xx:develop`.

I recommend creating an alias like (rename to something other than `18xx` if
you'd like):

```sh
alias 18xx="docker run -it --rm -p 3000:3000 --name 18xx-develop -v 18xx:/18xx kelsin/18xx:develop"
```

Once you do this you can run the development version of the site by just running
`18xx`. You can also run any other yarn script:

```sh
18xx build
18xx print
```

Running these commands without an alias can be done as well:

```sh
docker run -it --rm -p 3000:3000 \
       --name 18xx-develop \
       -v 18xx:/18xx \
       kelsin/18xx:develop \
       build

docker run -it --rm -p 3000:3000 \
       --name 18xx-develop \
       -v 18xx:/18xx \
       kelsin/18xx:develop \
       b18 1889 CGG01 "Christopher Giroir"
```

### Local Builds

There are [make](https://www.gnu.org/software/make/) goals for building,
running, and cleaning up a local develop docker image. These create the
`kelsin/18xx:local` image and use the `18xx` volume.

```sh
make docker/build
make docker/run
make docker/clean

# The following command runs:
# docker system prune -f --volumes
# NOTE: It might delete more than just 18xx stuff!
make docker/prune
```
