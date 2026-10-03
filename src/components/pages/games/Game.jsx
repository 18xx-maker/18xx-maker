import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useMatch, useNavigate } from "react-router";

import Viewport from "@/components/Viewport";

import { useEditor, useGame } from "@/hooks";
import { loadGame } from "@/state";
import capability from "@/util/capability";
import { getRenderInput } from "@/util/renderInput";

const addRecent = (game) => {
  // The capture windows of an export are not games the user opened
  if (game && capability.electron && !getRenderInput()) {
    window.api.addRecent(game.info.title, game.meta.slug);
  }
  return game;
};

const Game = () => {
  const game = useGame();
  const match = useMatch("/games/:slug/*");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inEditor = useEditor();

  useEffect(() => {
    if (!game || match.params.slug !== game.meta.slug) {
      dispatch(loadGame(match.params.slug))
        .then(addRecent)
        .catch(() => navigate("/games/"));
    }
  }, [dispatch, game, navigate, match]);

  // Wait for the game in the URL, a previously loaded game would otherwise
  // render under the new URL
  if (!game || game.meta.slug !== match.params.slug) {
    return null;
  }

  if (inEditor) {
    return (
      <Viewport>
        <Outlet />
      </Viewport>
    );
  }

  return <Outlet />;
};

export default Game;
