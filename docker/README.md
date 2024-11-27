# 18xx Maker in Docker

We maintain two docker images. The second one will be of interest if you want to
hack on 18xx Maker locally.

## [Production Site](https://github.com/18xx-maker/18xx-maker/pkgs/container/site)

The first docker image we maintain is a [nginx](https://hub.docker.com/_/nginx)
image with the full running site the way it appears on
[18xx-maker.com](https://18xx-maker.com) and is available as
`ghcr.io/18xx-maker/site`.

You can run this version locally with a command like:

```bash
docker run -it --rm -p 3000:80 --name 18xx-maker ghcr.io/18xx-maker/site
```

## [Developer Image](https://github.com/18xx-maker/18xx-maker/pkgs/container/develop)

> [!IMPORTANT]
> Knowledge of how to manage docker
> [volumes](https://docs.docker.com/engine/storage/volumes/) is important to use
> this docker image propertly.

The second image is a [node](https://hub.docker.com/_/node) image and contains
the development version of the site that you can run against a local volume to
keep changes. This docker version is capable of running all of the scripts and
comes with the headless chromium installed. This version is available as
`ghcr.io/18xx-maker/develop`.

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

You may also run pnpm commands without using an alias:

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

## Local Builds

There are [make](https://www.gnu.org/software/make/) goals for building,
running, and cleaning up the docker images locally. These all use a local volume
named `18xx-maker`.

```bash
# Build the site image
make docker/site

# Run the site image
make docker/serve

# Build the develop image
make docker/develop

# Run the develop image
make docker/start

# Remove both images
make docker/clean

# Remove the 18xx-maker volume
make docker/rm

# The following command runs:
# docker system prune -f --volumes
# NOTE: It might delete more than just 18xx Maker stuff!
make docker/prune
```
