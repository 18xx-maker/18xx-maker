import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useMatch, useNavigate } from "react-router";

import Viewport from "@/components/page/Viewport";

import { useEditor } from "@/hooks";
import { loadGame, validateLoadedGame } from "@/state";
import { selectGameForSlug } from "@/state/selectors";
import capability from "@/util/capability";
import { getRenderInput } from "@/util/renderInput";

const addRecent = (game) => {
  // The capture windows of an export are not games the user opened
  if (game && capability.electron && !getRenderInput()) {
    window.api.addRecent(game.info.title, game.meta.slug);
  }
  return game;
};

const GamePage = () => {
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

  // Check the game against the schema once it settles, so typing in the editor
  // does not check on every change
  useEffect(() => {
    if (!game) return;
    const timeout = setTimeout(() => dispatch(validateLoadedGame(game)), 500);
    return () => clearTimeout(timeout);
  }, [dispatch, game]);

  // Wait for the game in the URL, a previously loaded game would otherwise
  // render under the new URL
  if (!game) {
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

export default GamePage;
