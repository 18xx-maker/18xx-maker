import Color from "@/components/Color";

const Svg = ({
  className,
  width,
  height,
  viewBox,
  style,
  defs,
  children,
  preserveAspectRatio,
}) => {
  const namespaces = {
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
  };

  return (
    <Color>
      {() => (
        <svg
          version="1.1"
          preserveAspectRatio={preserveAspectRatio}
          width={width}
          height={height}
          viewBox={viewBox}
          style={style}
          className={className}
          {...namespaces}
        >
          <defs>{defs}</defs>
          {children}
        </svg>
      )}
    </Color>
  );
};

export default Svg;
