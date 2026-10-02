import clsx from "clsx";

import Toolbar from "@/components/Toolbar";
import Config from "@/components/config/Config";

import { useBooleanParam } from "@/util/query";

const Viewport = ({ children }) => {
  const [config] = useBooleanParam("config");
  const [print] = useBooleanParam("print");
  return (
    <div
      id="viewport"
      className={clsx(
        !print && "editor-checkered",
        "print:bg-none select-none overscroll-none",
      )}
    >
      {!print && <Toolbar />}
      {config && !print && <Config />}
      <div id="viewport-children">{children}</div>
    </div>
  );
};

export default Viewport;
