const { extendDefaultPlugins } = require("svgo");
module.exports = {
  full: false,
  multipass: true,
  recursive: true,
  precision: 6,
  js2svg: {
    pretty: true,
    indent: 2,
  },
  plugins: extendDefaultPlugins([
    {
      name: "removeViewBox",
      active: false,
    },
    {
      name: "cleanupIDs",
      params: {
        minify: false,
      },
    },
    {
      name: "sortAttrs",
      params: {
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
    {
      name: "inlineStyles",
      params: {
        onlyMatchedOnce: false,
        removeMatchedSelectors: true,
      },
    },
  ]),
};
