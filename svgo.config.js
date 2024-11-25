export default {
  full: false,
  multipass: true,
  recursive: true,
  precision: 6,
  quiet: true,
  js2svg: {
    pretty: true,
    indent: 2,
  },
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: {
            minify: false,
          },
          inlineStyles: {
            onlyMatchedOnce: false,
            removeMatchedSelectors: true,
          },
          removeUnknownsAndDefaults: {
            keepDataAttrs: false,
            keepAriaAttrs: false,
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
            ],
          },
        },
      },
    },
    "removeXMLNS",
    "removeXlink",
  ],
};
