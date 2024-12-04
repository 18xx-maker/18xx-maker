import Toolbar from "@/components/Toolbar";
import Config from "@/components/config/Config";

import { useBooleanParam } from "@/util/query";

const Viewport = ({ children }) => {
  const [config] = useBooleanParam("config");
  return (
    <div
      id="viewport"
      className="editor-checkered print:bg-none print:bg-white select-none overscroll-none"
    >
      <Toolbar />
      {config && <Config />}
      {children}
    </div>
  );
};

export default Viewport;
