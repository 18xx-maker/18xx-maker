# PDF Output

You can output straight to PDF files by running:

```sh
yarn build && yarn print <game>
```

where `<game>` is which game to build. For example, here is me printing 1830:

```sh
yarn build && yarn print 1830
```

Remember that this will not use the options setup in the browser config page. In
order to make your printed output identical to what you see in the browser, go
to the [config](/config) page and copy the json found at the bottom into
`src/config.json` replacing anything previously there.

This will build the app, then output a bunch of files into the
`build/render/1830` folder:

```sh
build/render/1830
├── 1830-background.pdf
├── 1830-cards-miniEuroDie.pdf
├── 1830-charters.pdf
├── 1830-map-paginated.pdf
├── 1830-map.pdf
├── 1830-market-paginated.pdf
├── 1830-market.pdf
├── 1830-revenue.pdf
├── 1830-tiles-offset.pdf
├── 1830-tile-manifest.pdf
└── 1830-tokens.pdf
```

If you want to build all games at once you can run:

```sh
yarn build && yarn print all
```
