import { useEffect } from "react";
import { withRouter } from "react-router";

const ScrollToTop = ({location, children}) => {
  useEffect(() => {
    if (!window._virtualConsole) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return children;
};

export default withRouter(ScrollToTop);
