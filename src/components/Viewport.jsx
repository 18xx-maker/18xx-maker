import { useLocation } from "react-router";

import { useSideMenu } from "@/hooks/useSideMenu";
import { up, useMediaQuery } from "@/ui";
import { useBooleanParam } from "@/util/query";
import styles from "./Viewport.module.css";

const Viewport = ({ sideNavOpen, children }) => {
  const needsSideMenu = useSideMenu();
  const [print] = useBooleanParam("print");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const configOpen = searchParams.has("config");

  const isSmall = useMediaQuery(up("sm"));
  const isMedium = useMediaQuery(up("md"));
  const isLarge = useMediaQuery(up("lg"));

  let marginLeft = "0px";
  let marginRight = "0px";
  if (!print) {
    if (needsSideMenu && (isMedium || sideNavOpen)) {
      marginLeft = "300px";
    }
    if (configOpen) {
      if (isLarge) {
        marginRight = "35%";
      } else if (isSmall) {
        marginRight = "50%";
      }
    }
  }
  let width = `calc(100% - ${marginLeft} - ${marginRight})`;

  // tabIndex: the area scrolls (a wide map overflows it sideways), so the
  // keyboard must be able to reach it, which is also what axe's
  // scrollable-region-focusable asks for. It is not conditional on the area
  // overflowing, because nothing reports a content overflow without watching
  // every descendant. Browsers that make scrollers focusable themselves add the
  // same stop. data-chrome is the hook for the print rules in styles/root.css
  return (
    <div
      data-testid="viewport"
      data-chrome="viewport"
      tabIndex={0}
      className={styles.viewport}
      style={{ width, marginLeft, marginRight }}
    >
      {children}
    </div>
  );
};

export default Viewport;
