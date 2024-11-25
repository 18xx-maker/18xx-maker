# Running Locally

**Note:** the easiest way to start using 18xx-maker is by using the [app
version](https://github.com/18xx-maker/18xx-maker/releases). Just download the
app and you're good to load in a game JSON file and start editing using your
favorite JSON editor. These instructions are ONLY if you want to develop on 18xx
Maker itself.

If you have experience with [Docker](https://www.docker.com/) and already have
it installed you can skip to the **Using Docker** section.

## Node.js and PNPM

### Dependencies

First you need to install node.js and pnpm.

On a mac I would recommend using the [homebrew package
manager](https://brew.sh/) to do this. Once homebrew is installed (you can
follow directions on their site) you can run:

```bash
brew install pnpm node
```

This will install [node](https://nodejs.org/) and [pnpm](https://pnpm.io/) for
you.

You can also install node directly from [their website](https://nodejs.org/) and
pnpm using one of their [installation methods](https://pnpm.io/installation).

### Getting the site code

This site is stored as a [git](https://git-scm.com/) repository hosted on
[github](https://github.com/). You can use any normal git client to get the
[source code](https://github.com/18xx-maker/18xx-maker). You can also just
download of a [zip file of the latest
code](https://github.com/18xx-maker/18xx-maker/archive/master.zip).

Extract the zip file (or `git clone` the repository) to any directory that you
want.

### Running the site

Once you have the site in a folder, and pnpm installed you need to open a
command prompt (on Windows) or a Terminal (on Mac) to the site folder and you
can use the following commands:

```bash
# Install all dependencies
pnpm install

# Run the development version of the site
pnpm start

# Run (and watch) tests
pnpm test
```

**Important:** Anytime you update the site's code (from git or from downloading
a new zip) you should run `pnpm install` again to update your dependencies.

## Using Docker

### [Production Site](https://github.com/18xx-maker/18xx-maker/pkgs/container/site)

The first docker image we maintain is a [nginx](https://hub.docker.com/_/nginx)
image with the full running site the way it appears on
[18xx-maker.com](https://18xx-maker.com) and is available as
`ghcr.io/18xx-maker/site`.

You can run this version locally with a command like:

```bash
docker run -it --rm -p 3000:80 --name 18xx-maker ghcr.io/18xx-maker/site
```

### [Developer Image](https://github.com/18xx-maker/18xx-maker/pkgs/container/develop)

The second image is a [node](https://hub.docker.com/_/node) image and contains
the development version of the site that you can run against a local volume to
keep changes. Knowledge of how to manage docker volumes is important to use this
properly. This docker version is capable of running all of the scripts (using
playwright) as well and comes with the headless chromium installed. This version
is available as `ghcr.io/18xx-maker/develop`.

I recommend creating an alias like (rename to something other than `maker` if
you'd like):

```bash
alias maker="docker run -it --rm -p 3000:3000 --name 18xx-maker -v 18xx-maker:/app ghcr.io/18xx-maker/develop"
```

Once you do this you can run the development version of the site by just running
`maker`. You can also run any other pnpm script:

```bash
# Build the site
maker build

# Print 1889
maker print
```

Running these commands without an alias can be done as well:

```bash
docker run -it --rm -p 3000:3000 \
       --name 18xx-maker \
       -v 18xx-maker:/app \
       ghcr.io/18xx-maker/develop \
       build

docker run -it --rm -p 3000:3000 \
       --name 18xx-maker \
       -v 18xx-maker:/app \
       ghcr.io/18xx-maker/develop \
       b18 1889 CGG01 "Christopher Giroir"
```

### Local Builds

There are [make](https://www.gnu.org/software/make/) goals for building,
running, and cleaning up the docker images locally. The develop image uses a
volume named `18xx-maker`.

```bash
# Build the site image
make docker/site

# Run the site image
make docker/serve

# Build the develop image
make docker/develop

# Run the develop image
make docker/start

# Clean both images
make docker/clean

# The following command runs:
# docker system prune -f --volumes
# NOTE: It might delete more than just 18xx stuff!
make docker/prune
```
