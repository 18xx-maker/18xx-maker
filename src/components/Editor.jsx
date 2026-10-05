import Svg from "@/components/Svg";
import SvgEditor from "@/components/SvgEditor";

import { usePrint } from "@/hooks";
import { useBooleanParam } from "@/util/query";
import { getRenderInput } from "@/util/renderInput";

// The pan and zoom editor is only for the screen. Printing, ?print=true and
// render mode (the exports) get the svg at its physical size. The exports only
// switch to the print media type once the page is ready, the editor would
// still be the size of the window when the image is captured.
export const useEditing = () => {
  const print = usePrint();
  const [printParam] = useBooleanParam("print");
  return !(print || printParam || getRenderInput());
};

const Editor = ({ width, height, className, padding, ...pass }) => {
  if (!useEditing()) {
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
      padding={padding}
      {...pass}
    />
  );
};

export default Editor;
