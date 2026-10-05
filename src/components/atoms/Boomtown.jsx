import Color from "@/components/Color";
import Name from "@/components/atoms/Name";
import { centerTownCircles, stadiumPath } from "@/components/atoms/townParts";

import { useConfig, useGame } from "@/hooks";
import { multiDefaultTo } from "@/util";

const cityPaths = {
  cityPath: "M 0 30 A 30 30 0 0 1 0 -30 A 30 30 0 0 1 0 30",
  cityPathReverse: "M 0 -30 A 30 30 0 0 0 0 30 A 30 30 0 0 0 0 -30",
  city2Path:
    "M 0 30 L -25 30 A 30 30 0 0 1 -25 -30 L 25 -30 A 30 30 0 0 1 25 30 L 0 30",
  city2PathReverse:
    "M 0 -30 L -25 -30 A 30 30 0 0 0 -25 30 L 25 30 A 30 30 0 0 0 25 -30 L 0 -30",
  city3Path:
    "M 0 44 L -28 44 A 30 30 0 0 1 -50 -1 L -25 -44 A 30 30 0 0 1 25 -44 L 50 -1 A 30 30 0 0 1 28 44 L 0 44",
  city3PathReverse:
    "M 0 44 L 28 44 A 30 30 0 0 0 50 -1 L 25 -44 A 30 30 0 0 0 -25 -44 L -50 -1 A 30 30 0 0 0 -28 44 L 0 44",
  city4Path:
    "M 0 53 L -25 53 A 30 30 0 0 1 -53 25 L -53 -25 A 30 30 0 0 1 -25 -53 L 25 -53 A 30 30 0 0 1 53 -25 L 53 25 A 30 30 0 0 1 25 53 L 0 53",
  city4PathReverse:
    "M 0 53 L 25 53 A 30 30 0 0 0 53 25 L 53 -25 A 30 30 0 0 0 25 -53 L -25 -53 A 30 30 0 0 0 -53 -25 L -53 25 A 30 30 0 0 0 -25 53 L 0 53",
};

// A city, the track colored ring around it and the dashed boomtown ring
const cityRings = (
  c,
  { key, cx, cityWidth, centerTownWidth, strokeWidth, strokeDashArray },
) => [
  <g key={`city${key}`}>
    <circle fill={c("city")} stroke="none" cx={cx} cy="0" r={cityWidth} />
  </g>,
  <g key={`city${key}-otherthing`}>
    <circle
      fill="none"
      stroke={c("track")}
      strokeWidth={strokeWidth}
      cx={cx}
      cy="0"
      r={cityWidth}
    />
  </g>,
  <g key={`boomtown${key}-outline`}>
    <circle
      fill="none"
      stroke="black"
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDashArray}
      cx={cx}
      cy="0"
      r={centerTownWidth}
    />
  </g>,
];

const Boomtown = ({
  border,
  borderWidth,
  city,
  size,
  name,
  color,
  bgColor,
  width,
  townWidth,
  strokeWidth,
  strokeDashArray,
  dashed,
}) => {
  const game = useGame();
  const { config } = useConfig();
  const straightCityNames = config.straightCityNames;

  if (size === undefined) {
    size = 1;
  }

  let cityWidth = multiDefaultTo(25, width, game.info.cityWidth / 2);
  let scale = cityWidth / 25;
  let centerTownWidth = multiDefaultTo(
    (cityWidth * 2) / 5,
    townWidth,
    game.info.townWidth / 2,
  );
  borderWidth = multiDefaultTo(4, borderWidth, game.info.borderWidth) * scale;

  let path = null;
  let nameNode = null;
  strokeWidth = strokeWidth || 2;

  if (size === 1) {
    if (border) {
      return (
        <Color>
          {(c) => (
            <circle
              fill={c("border")}
              stroke="none"
              cx="0"
              cy="0"
              r={(city ? cityWidth : centerTownWidth) + borderWidth}
            />
          )}
        </Color>
      );
    }

    if (name && !straightCityNames && !name.straight) {
      let pathWidth = cityWidth + 5;
      if (name.reverse) {
        path = `M 0 -${pathWidth} A ${pathWidth} ${pathWidth} 0 0 0 0 ${pathWidth} A ${pathWidth} ${pathWidth} 0 0 0 0 -${pathWidth}`;
      } else {
        path = `M 0 ${pathWidth} A ${pathWidth} ${pathWidth} 0 0 1 0 -${pathWidth} A ${pathWidth} ${pathWidth} 0 0 1 0 ${pathWidth}`;
      }
    }

    if (name) {
      let x = name.x || 0;
      let y = name.y || (name.reverse ? 7 : 0);
      if (straightCityNames || name.straight) {
        y -= name.reverse ? -cityWidth : cityWidth + 8;
      }
      //if (straightCityNames) {
      // y -= name.reverse ? -20 : 28;
      //}

      nameNode = (
        <Name
          bgColor={bgColor}
          {...name}
          x={x}
          y={y}
          doRotation={true}
          path={path}
        />
      );
    }

    if (city) {
      // dashed true is default, so false is what to watch for
      strokeDashArray =
        dashed === false ? "1 0" : strokeDashArray || `${scale * 4}`;
      return (
        <Color context="companies">
          {(c) => (
            <>
              {cityRings(c, {
                key: "",
                cx: "0",
                cityWidth,
                centerTownWidth,
                strokeWidth,
                strokeDashArray,
              })}
              {nameNode}
            </>
          )}
        </Color>
      );
    } else {
      // dashed true is default, so false is what to watch for
      strokeDashArray =
        dashed === false ? "1 0" : strokeDashArray || `${scale * 6}`;
      return (
        <Color context="companies">
          {(c) => (
            <>
              {centerTownCircles(c, {
                key: "center-town",
                cx: "0",
                r: centerTownWidth,
                color,
              })}
              <g key="boomtown-outline">
                <circle
                  fill="none"
                  stroke="black"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDashArray}
                  cx="0"
                  cy="0"
                  r={cityWidth}
                />
              </g>
              {nameNode}
            </>
          )}
        </Color>
      );
    }
  } else if (size === 2) {
    if (border) {
      let borderWidth = city ? cityWidth + 2 : centerTownWidth + 6;
      return (
        <Color>
          {(c) => (
            <g>
              <path
                d={stadiumPath(borderWidth, borderWidth + 1, 1)}
                fill={c("border")}
                stroke="none"
              />
            </g>
          )}
        </Color>
      );
    }

    let nameNode = null;

    if (name) {
      let path;
      let y = name.y || (name.reverse ? 7 : 0);
      if (straightCityNames || name.straight) {
        path = null;
        y -= name.reverse ? -24 : 32;
      } else {
        let pathName = `city${size > 1 ? size : ""}Path`;
        if (name.reverse) {
          pathName = pathName + "Reverse";
        }
        path = cityPaths[pathName];
      }
      nameNode = (
        <Name bgColor={bgColor} {...name} y={y} path={path} doRotation={true} />
      );
    }

    if (city) {
      // dashed true is default, so false is what to watch for
      strokeDashArray =
        dashed === false ? "1 0" : strokeDashArray || `${scale * 4}`;
      return (
        <Color context="companies">
          {(c) => (
            <>
              {cityRings(c, {
                key: "",
                cx: `${cityWidth}`,
                cityWidth,
                centerTownWidth,
                strokeWidth,
                strokeDashArray,
              })}
              {cityRings(c, {
                key: "2",
                cx: `-${cityWidth}`,
                cityWidth,
                centerTownWidth,
                strokeWidth,
                strokeDashArray,
              })}
              <g>
                <path
                  d={`M-${cityWidth},${cityWidth} L${cityWidth},${cityWidth}`}
                  stroke="black"
                  strokeWidth={strokeWidth}
                />
                <path
                  d={`M-${cityWidth},-${cityWidth} L${cityWidth},-${cityWidth}`}
                  stroke="black"
                  strokeWidth={strokeWidth}
                />
              </g>
              {nameNode}
            </>
          )}
        </Color>
      );
    } else {
      // dashed true is default, so false is what to watch for
      strokeDashArray =
        dashed === false ? "1 0" : strokeDashArray || `${scale * 6}`;
      return (
        <Color context="companies">
          {(c) => (
            <>
              <g key="boomtown-outline">
                <circle
                  fill="none"
                  stroke="black"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDashArray}
                  cx={`-${centerTownWidth + 3}`}
                  cy="0"
                  r={cityWidth}
                />
              </g>
              <g key="boomtown2-outline">
                <circle
                  fill="none"
                  stroke="black"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDashArray}
                  cx={`${centerTownWidth + 3}`}
                  cy="0"
                  r={cityWidth}
                />
              </g>
              <g key="outline">
                <path
                  d={stadiumPath(centerTownWidth + 4, centerTownWidth + 4)}
                  fill={c("white")}
                  stroke={c("track")}
                  strokeWidth="2"
                />
              </g>
              {centerTownCircles(c, {
                key: "center-town",
                cx: `-${centerTownWidth + 3}`,
                r: centerTownWidth,
                color,
              })}
              {centerTownCircles(c, {
                key: "center-town2",
                cx: `${centerTownWidth + 3}`,
                r: centerTownWidth,
                color,
              })}
              {nameNode}
            </>
          )}
        </Color>
      );
    }
  }
};

export default Boomtown;
