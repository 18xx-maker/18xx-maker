import { useSelector } from "react-redux";

import { selectAssets } from "@/state/selectors";

// The custom images of the game on screen (see util/assets): undefined when
// the game has none
export const useAssets = () => useSelector(selectAssets);
