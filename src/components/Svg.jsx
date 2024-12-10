import { forwardRef } from "react";

import Color from "@/components/Color";

const Svg = (
  {
    className,
    width,
    height,
    viewBox,
    style,
    defs,
    children,
    preserveAspectRatio,
    ...pass
  },
  ref,
) => {
  const namespaces = {
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
  };

  return (
    <Color>
      {() => (
        <svg
          ref={ref}
          version="1.1"
          preserveAspectRatio={preserveAspectRatio}
          width={width}
          height={height}
          viewBox={viewBox}
          style={style}
          className={className}
          {...namespaces}
          {...pass}
        >
          <defs>{defs}</defs>
          {children}
        </svg>
      )}
    </Color>
  );
};

export default forwardRef(Svg);
