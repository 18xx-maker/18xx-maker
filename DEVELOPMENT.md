# 18xx Maker Development

> [!WARNING]
> The easiest way to start using 18xx-maker is by using the
> [app](https://github.com/18xx-maker/18xx-maker/releases) or the
> [website](https://18xx-maker.com). These instructions are **ONLY** if you want
> to develop on 18xx Maker itself. You can find [more
> documentation](https://18xx-maker.com/docs) on general usage in the help
> section of the website.

> [!IMPORTANT]
> These docs assume an understanding of development practices and using a
> terminal and command line programs. If you are interested in development but
> don't meet this requirement please ask for help in [the 18xx Maker
> Discord](https://discord.gg/gcYvAjYYfw).

## Installation

You can develop on 18xx Maker on your local computer or by using Docker. We only
recommend using Docker if you already have a good understanding of software
development using it. Documentation about using the Docker images is available
in
[docker/README.md](https://github.com/18xx-maker/18xx-maker/blob/main/docker/README.md)

### Prerequisites

In order to develop on 18xx Maker you need [git](https://git-scm.com/),
[NodeJS](https://nodejs.org), and [pnpM](https://pnpm.io/). Git is the tool we
use to store and version the source code. NodeJS is a javascript runtime that
lets you run javascript on your computer. pnpM is a package manager for NodeJS
that lets you install all of the dependencies for this project. You can follow
the directions from these projects for [installing
git](https://git-scm.com/downloads), [installing
NodeJS](https://nodejs.org/en/download/), and [installing
pnpM](https://pnpm.io/installation).

> [!TIP]
> I personally use [macOS](https://www.apple.com/macos/) as my main development
> environment. I use [nodenv](https://github.com/nodenv/nodenv) to manage my
> node versions locally and I install [git](https://git-scm.com/downloads/mac)
> and [pnpm](https://pnpm.io/installation#using-homebrew) from
> [homebrew](https://brew.sh/).

> [!WARNING]
> You should be able to use Node's built in package manager
> [npm](https://www.npmjs.com) or [yarn](https://classic.yarnpkg.com) but their
> usage is not supported.

### Running the development site

The first step is checking out the code:

```shell
# Move to a relevant folder and download the source code
git clone git@github.com:18xx-maker/18xx-maker.git
```

> [!TIP]
> If you want to make contributions to 18xx Maker you should probably create
> your own Github
> [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks)
> and hack on that, sending us a pull request with your changes when you are
> ready.

Now from the newly created `18xx-maker` folder you can install the dependencies
and start a development build of the site:

```shell
# Install the dependencies
pnpm install

# Run the development site
pnpm start
```

> [!IMPORTANT]
> Anytime you update the site's code (from git or from downloading a new zip)
> you should run `pnpm install` again to update your dependencies.

## Scripts

These are the package.json scripts that you should know:

```shell
# Start the development versions of the site, app, or storybook site:
pnpm start
pnpm start:app
pnpm start:sb
```

The following scripts are all run for you on relevant files as part of git
commit hooks, and in CI. They are here if you want or need to run them manually:

```shell
# Run the tests in watch mode
pnpm test

# Run all fixing linters
pnpm fix

# Run schema validation on all data json files:
pnpm validate

# Optimize SVGs
pnpm svgo
```

There are the commands to preview and build the production versions of the site,
app and storybook site:

```shell
# Preview the production builds
pnpm preview
pnpm preview:app

# Build the production site, electron app, or storybook site:
pnpm build
pnpm build:app
pnpm build:sb
```

### Make

There are also a few goals for [make](https://www.gnu.org/software/make/) that
are helpful.

```shell
# Compile the json schemas
# This is run automatically for you on git commit hooks
make

# Clean all generated output (from all of the build commands above)
make clean
```

The other make goals are all for [Docker
development](https://github.com/18xx-maker/18xx-maker/blob/main/docker/README.md)

## File Layout

At a high level the folder structure looks like:

```shell
.
├── bin               # CLI scripts
├── dist              # All built sites / apps end up in here
│   ├── app           # The built electron apps
│   ├── main          # The built esbuild for the main electron process
│   ├── preload       # The built esbuild for the preload file
│   ├── site          # The built esbuild for the main 18xx Maker site
│   ├── sb            # The built esbuild for the storybook site
│   └── renderer      # The built esbuild for the preload file
├── docker            # Stuff only related to docker builds
├── electron          # Electron related src files
│   ├── assets        # Files that we need when building electorn
│   ├── main          # The src for the electron main process
│   └── preload       # The preload file injected into the render process
├── public            # Files that are just served statically
├── src
│   ├── cli           # CLI related files
│   ├── components    # React Components
│   ├── context       # React Contexts
│   ├── data          # Data files that are built into the app (games, icons, logos, etc)
│   ├── defaults.json # Default config file values
│   ├── docs          # All help page markdowns
│   ├── hooks         # React hooks
│   ├── index.jsx     # React root of the project
│   ├── locales       # Localization files
│   ├── routes.jsx    # React Router route definitions
│   ├── schemas       # JSON schemas for all 18xx Maker data files
│   ├── state         # Redux state store related files
│   ├── styles        # All css files
│   └── util          # Utility helpers
└── tests             # Any e2e testing or test helper files
```
