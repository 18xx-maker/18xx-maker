import { useEffect } from "react";
import { useLocation } from "react-router";

import { trackPageview } from "@/util/analytics";

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageview(location);
  }, [location]);
};

export default Analytics;
