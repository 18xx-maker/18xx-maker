import Color from "@/components/Color";
import { useOrientation } from "@/context/OrientationContext";
import { useConfig } from "@/hooks";

const colorblindSymbols = {
  plain: "",
  yellow: "⏷",
  green: "⏹",
  land: "⏹",
  brown: "⏺",
  gray: "✱",
  grey: "✱",
  orange: "★",
  red: "⨉",
  offboard: "⨉",
  mountain: "⏶",
  water: "〜",
};

const symbol = (color) => {
  return colorblindSymbols[color] || "";
};

const Id = ({ id, displayID, extra, bgColor, noID }) => {
  const { config } = useConfig();
  const rotation = useOrientation();

  if (noID || config.tiles.id === "none") {
    return null;
  }

  if (config.tiles.colorblind) {
    const [background, stripe] = bgColor.split("/");

    if (stripe) {
      id = `${symbol(background)} ${symbol(stripe)} ${id}`;
    } else {
      id = `${symbol(background)} ${id}`;
    }
  }

  let fontSize = id && id.length > 4 ? "9" : id && id.length > 3 ? "10" : "12";
  let extraFontSize =
    extra && extra.length > 4 ? "9" : extra && extra.length > 3 ? "10" : "12";

  // Otherwise it's right or left
  let idAnchor = "end";
  let extraAnchor = "start";
  let idX = 40;
  let extraX = -40;
  if (config.tiles.id === "left") {
    idAnchor = "start";
    extraAnchor = "end";
    idX = -40;
    extraX = 40;
  }

  return (
    <Color>
      {(c) => (
        <>
          <g transform={`rotate(${rotation}) translate(${idX} 70)`}>
            <text
              fontFamily="sans-serif"
              fill={c("black")}
              stroke="none"
              strokeLinecap="round"
              strokeLinejoin="bevel"
              dominantBaseline="baseline"
              textAnchor={idAnchor}
              fontSize={fontSize}
              fontWeight="normal"
              x="0"
              y="0"
            >
              {displayID || id}
            </text>
          </g>
          {extra && (
            <g transform={`rotate(${rotation}) translate(${extraX} 70)`}>
              <text
                fontFamily="sans-serif"
                fill={c("black")}
                stroke="none"
                strokeLinecap="round"
                strokeLinejoin="bevel"
                dominantBaseline="baseline"
                textAnchor={extraAnchor}
                fontSize={extraFontSize}
                x="0"
                y="0"
              >
                {extra}
              </text>
            </g>
          )}
        </>
      )}
    </Color>
  );
};

export default Id;
