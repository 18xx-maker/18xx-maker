import Svg from "@/components/Svg";
import SvgEditor from "@/components/SvgEditor";

import { usePrint } from "@/hooks";

const Editor = ({ width, height, ...pass }) => {
  const print = usePrint();

  if (print) {
    return (
      <Svg
        className="printElement"
        width={`${width / 100}in`}
        height={`${height / 100}in`}
        viewBox={`0 0 ${width} ${height}`}
        {...pass}
      />
    );
  }

  return <SvgEditor width={width} height={height} {...pass} />;
};

export default Editor;
