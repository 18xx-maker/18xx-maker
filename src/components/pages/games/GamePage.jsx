import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Viewport from "@/components/page/Viewport";

import { useEditor } from "@/hooks";
import { useMatch, useNavigate } from "@/router";
import { loadGame } from "@/state";
import { selectGameForSlug } from "@/state/selectors";
import { addRecent } from "@/util/recent";

const GamePage = ({ children }) => {
  const match = useMatch("/games/:slug/*");
  const game = useSelector((state) =>
    selectGameForSlug(state, match.params.slug),
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inEditor = useEditor();

  useEffect(() => {
    if (!game) {
      dispatch(loadGame(match.params.slug))
        .then(addRecent)
        .catch(() => navigate("/games/"));
    }
  }, [dispatch, game, navigate, match]);

  // Wait for the game in the URL, a previously loaded game would otherwise
  // render under the new URL
  if (!game) {
    return null;
  }

  if (inEditor) {
    return <Viewport>{children}</Viewport>;
  }

  return children;
};

export default GamePage;
