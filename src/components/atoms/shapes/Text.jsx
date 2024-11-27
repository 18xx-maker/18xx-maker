import { defaultTo } from "ramda";

import Color from "@/components/Color";
import RotateContext from "@/context/RotateContext";
import { getFontProps } from "@/util";

const Text = (props) => {
  let { text, fontFamily, color, rotation, fixed } = props;
  let font = getFontProps(props, null, null, fontFamily);

  return (
    <RotateContext.Consumer>
      {(rotateContext) => (
        <Color context="map">
          {(c) => (
            <text
              transform={
                fixed || rotateContext.fixed
                  ? null
                  : `rotate(${-rotateContext.angle - (rotation || 0)})`
              }
              fill={c(defaultTo("black", color))}
              {...font}
              dominantBaseline="central"
              textAnchor="middle"
            >
              {text}
            </text>
          )}
        </Color>
      )}
    </RotateContext.Consumer>
  );
};

export default Text;
