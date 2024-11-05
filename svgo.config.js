export default {
  full: false,
  multipass: true,
  recursive: true,
  precision: 6,
  js2svg: {
    pretty: false,
    indent: 2
  },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: {
            minify: false
          },
          inlineStyles: {
            onlyMatchedOnce: false,
            removeMatchedSelectors: true
          },
          sortAttrs: {
            order: [
              "id",
              "class",
              "fill",
              "stroke",
              "stroke-width",
              "style",
              "width",
              "height",
              "x",
              "x1",
              "x2",
              "y",
              "y1",
              "y2",
              "cx",
              "cy",
              "r",
              "market",
              "d",
              "points",
            ]
          }
        }
      }
    }
  ]
};
