# Running Locally

If you want to run this site locally either for development this is how to do so.

If you have experience with [Docker](https://www.docker.com/) and already have
it installed you can skip to the [Using Docker](#using-docker) section.

## Node.js and Yarn

### Dependencies

First you need to install node.js and yarn.

On a mac I would recommend using the [homebrew package manager](https://brew.sh/) to do this. Once homebrew is installed (you can follow directions on their site) you can run:

```sh
brew install yarn
```

This will install [node](https://nodejs.org/) and [yarn](https://yarnpkg.com/)
for you.

You can also install node directly from [their website](https://nodejs.org/) and yarn using one of their [installation methods](https://yarnpkg.com/docs/install).

### Getting the site code

This site is stored as a [git](https://git-scm.com/) repository hosted on
[github](https://github.com/). You can use any normal git client to get the
[source code](https://github.com/18xx-maker/18xx-maker). You can also just download of a
[zip file of the latest
code](https://github.com/18xx-maker/18xx-maker/archive/master.zip).

Extract the zip file (or `git clone` the repository) to any directory that you want.

### Running the site

Once you have the site in a folder, and yarn installed you need to open a command prompt (on Windows) or a Terminal (on Mac) to the site folder and run:

```sh
yarn
```

to install all of the third party software that runs the site, and then:

```sh
yarn start
```

to run the site! This will open up a browser pointing to your locally run
site. You can now edit game files and see the updates in the browser
immediately.

## Using Docker

If you have docker installed (or available) you can run a [public docker
image](https://hub.docker.com/r/kelsin/18xx) that includes all games. Run the
following command and the site should be available at http://localhost (you
might need to edit the port depending on your OS and other running apps):

```sh
docker run -it --rm -p 80:80 --name 18xx kelsin/18xx
```

### Persistant Docker Volume

If you want to use docker to hack on the site, you can use a docker volume to
keep a persistant image of the game code. Knowledge of how to manage docker
volumes is important to use this properly.

```sh
docker run -it --rm -p 3000:3000 \
       --name 18xx-develop \
       -v 18xx:/home/18xx \
       kelsin/18xx:develop
```

This will run the react-development server that will live update if you edit
files, and store anything edited (starting with the current code) on the volume
named `18xx`.
