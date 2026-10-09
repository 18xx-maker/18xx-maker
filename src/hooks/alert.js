import { useSelector } from "react-redux";

import { selectAlerts } from "@/state/alerts";

export const useAlerts = () => useSelector(selectAlerts);
