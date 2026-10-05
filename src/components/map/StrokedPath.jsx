import { addIndex, concat, map } from "ramda";

import Color from "@/components/Color";

import { mapCoord } from "@/util/map";

// A border or a line on the map: a path drawn once as its background stroke
// (`bg`) and once as its colored stroke.
const StrokedPath = ({ item, data, bg, honorDashArray }) => {
  let path =
    "M " + map((coord) => mapCoord(coord, data), item.coords).join(" L ");

  let width = (item.width || 8) * data.scale;
  let borderWidth = item.borderWidth
    ? item.borderWidth * data.scale
    : width + 4 * data.scale;

  let linecap = "round";
  let linejoin = "round";

  let strokeDashOffset = 0;
  let strokeDashArray = "none";

  if (item.dashed) {
    strokeDashArray = (honorDashArray && item.dashArray) || width * 2.5;
    if (item.offset) {
      strokeDashOffset = item.offset;
    }
  }

  return (
    <Color context="companies">
      {(c) => (
        <g>
          {item.border === false ||
            (bg && (
              <path
                d={path}
                fill="none"
                stroke={c("track")}
                strokeWidth={borderWidth}
                strokeLinecap={linecap}
                strokeLinejoin={linejoin}
                strokeDasharray={strokeDashArray}
                strokeDashoffset={strokeDashOffset}
              />
            ))}
          {bg || (
            <path
              d={path}
              fill="none"
              stroke={c(item.color)}
              strokeWidth={width}
              strokeLinecap={linecap}
              strokeLinejoin={linejoin}
              strokeDasharray={strokeDashArray}
              strokeDashoffset={strokeDashOffset}
            />
          )}
        </g>
      )}
    </Color>
  );
};

// All the items, backgrounds first so the colored strokes sit on top
export const strokedPaths = (items, data, name, honorDashArray) =>
  concat(
    addIndex(map)(
      (item, i) => (
        <StrokedPath
          key={`${name}-bg-${i}`}
          bg={true}
          item={item}
          data={data}
          honorDashArray={honorDashArray}
        />
      ),
      items || [],
    ),
    addIndex(map)(
      (item, i) => (
        <StrokedPath
          key={`${name}-${i}`}
          item={item}
          data={data}
          honorDashArray={honorDashArray}
        />
      ),
      items || [],
    ),
  );
