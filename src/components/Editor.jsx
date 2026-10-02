import Svg from "@/components/Svg";
import SvgEditor from "@/components/SvgEditor";

import { usePrint } from "@/hooks";
import { useBooleanParam } from "@/util/query";

// The pan and zoom editor is only for the screen. Printing, and the exports
// that load a page with ?print=true (they do not use the print media type),
// get the svg at its physical size.
const Editor = ({ width, height, className, ...pass }) => {
  const print = usePrint();
  const [printParam] = useBooleanParam("print");

  if (print || printParam) {
    return (
      <Svg
        className={className}
        width={`${width / 100}in`}
        height={`${height / 100}in`}
        viewBox={`0 0 ${width} ${height}`}
        {...pass}
      />
    );
  }

  return (
    <SvgEditor
      key={`${width}x${height}`}
      width={width}
      height={height}
      {...pass}
    />
  );
};

export default Editor;
