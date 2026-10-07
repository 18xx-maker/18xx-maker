import { useEffect } from "react";

import { useLocation } from "@/router";

const ScrollToTop = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // A #heading link scrolls to its heading instead (see Docs)
    if (!window._virtualConsole && !location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return children;
};

export default ScrollToTop;
