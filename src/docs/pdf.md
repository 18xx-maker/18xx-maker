# PDF Output

You can output straight to PDF files by running:

```sh
yarn build && yarn print <game>
```

where `<game>` is which game to build. For example, here is me printing 1830:

```sh
yarn build && yarn print 1830
```

This will build the app, then output a bunch of files into the
`build/render/1830` folder:

```sh
build/render/1830
├── background.pdf
├── cards.pdf
├── charters.pdf
├── map-paginated.pdf
├── map.pdf
├── market-paginated.pdf
├── market.pdf
├── revenue.pdf
├── tiles.pdf
├── tile-manifest.pdf
└── tokens.pdf
```

You only need to include the `yarn build &&` at the beginning of the command if
you have never run it, or if you made changes too the app since the last time
you ran it.
