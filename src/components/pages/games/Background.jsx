import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import makeStyles from "@mui/styles/makeStyles";

import { flatten, times } from "ramda";

import Color from "@/components/Color";
import PageSetup from "@/components/PageSetup";
import config from "@/defaults.json";
import { useGame } from "@/hooks/game.js";
import { printableHeight, printableWidth, unitsToCss } from "@/util";

const useStyles = makeStyles(() => ({
  backgroundBox: {
    overflow: "auto",
  },
}));

const radians = (degrees) => degrees * (Math.PI / 180);
const sin = Math.sin(radians(30));
const cos = Math.cos(radians(30));
const rotatedWidth = (w, h) => Math.abs(w * cos + h * sin);
const rotatedHeight = (w, h) => Math.abs(h * cos + w * sin);

const Background = () => {
  const classes = useStyles();

  let game = useGame();
  let paper = config.paper;

  let color = game.info.background;
  let title = game.info.title;

  let pageWidth = printableWidth(paper);
  let pageHeight = printableHeight(paper);

  let containerWidth = rotatedWidth(pageWidth, pageHeight);
  let containerHeight = rotatedHeight(pageWidth, pageHeight);

  let text = null;
  let [BB, setBB] = useState({
    x: 0,
    y: 0,
    width: containerWidth,
    height: containerHeight,
  });
  useEffect(() => setBB(text.getBBox()), [title, text]);

  let textWidth = BB.width + 12;
  let textHeight = BB.height;

  let cols = Math.min(Math.max(Math.ceil(containerWidth / textWidth), 1), 150);
  let rows = Math.min(
    Math.max(Math.ceil(containerHeight / textHeight), 1),
    150,
  );

  let textNodes = flatten(
    times(
      (x) =>
        times(
          (y) => (
            <text
              key={`${title}-${x}-${y}`}
              x={x * textWidth}
              y={y * textHeight}
              fill="#fff"
              opacity="0.2"
            >
              {title}
            </text>
          ),
          rows,
        ),
      cols,
    ),
  );

  return (
    <Color context="companies">
      {(c) => (
        <Box className={classes.backgroundBox}>
          <div
            className="background printElement"
            data-testid={`game-${game.meta.slug}-background`}
            style={{
              width: unitsToCss(pageWidth),
              height: unitsToCss(pageHeight),
              backgroundColor: c(color),
            }}
          >
            <svg
              viewBox={`0 0 ${pageWidth} ${pageHeight}`}
              fontSize="20"
              style={{
                width: unitsToCss(pageWidth),
                height: unitsToCss(pageHeight),
              }}
            >
              <text style={{ visibility: "hidden" }} ref={(r) => (text = r)}>
                {title}
              </text>
              <g
                transform={`translate(${(containerWidth - pageWidth) / -2.0} ${(containerHeight - pageHeight) / -2.0}) rotate(-30 ${containerWidth / 2} ${containerHeight / 2})`}
              >
                {textNodes}
              </g>
            </svg>
            {/* <div className="text">{text}</div> */}
            <PageSetup landscape={false} />
          </div>
        </Box>
      )}
    </Color>
  );
};

export default Background;
