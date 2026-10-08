import { useEffect } from "react";

import { useGame } from "@/hooks";
import { useMatch } from "@/router";

// Tells the caller of render mode (document.body.dataset.renderState) when the
// page is done. "ready": the game is in the store on one of its pages, the
// fonts are loaded and what the page measured with them is rendered. "empty":
// the page went somewhere else, because the game has no data for it.
const RenderState = () => {
  const game = useGame();
  const match = useMatch("/games/:slug/*");
  const onPage = !!match && match.params["*"] !== "";

  useEffect(() => {
    const { dataset } = document.body;

    if (!onPage) {
      dataset.renderState = "empty";
      return;
    }

    if (!game) {
      return;
    }

    // Background measures its text in an effect, a timer later it has rendered
    // with it. Frames are not used, hidden windows do not get them.
    let timer;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) {
        timer = setTimeout(() => {
          dataset.renderState = "ready";
        }, 0);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [game, onPage]);

  return null;
};

export default RenderState;
