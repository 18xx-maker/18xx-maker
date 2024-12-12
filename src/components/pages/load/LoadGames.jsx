import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { chain, compose, map, prop, sortBy, values } from "ramda";

import { FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

import GameRow from "@/components/pages/load/GameRow";

import { createAlert, loadSummaries } from "@/state";
import capability from "@/util/capability";
import * as idb from "@/util/idb";
import * as opfs from "@/util/opfs";

const sortSummaries = compose(sortBy(prop("title")), chain(values), values);

const LoadGames = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const summaries = useSelector((state) => state.summaries);
  const navigate = useNavigate();

  // Load all summaries
  useEffect(() => {
    dispatch(loadSummaries());
  }, [dispatch]);

  // const deleteHandler = (slug) => {
  //   dispatch(deleteGame(slug))
  //     .then(() => dispatch(loadSummaries()))
  //     .catch(() => {});
  // };

  const gameRows = map(
    (game) => <GameRow game={game} key={game.slug} />,
    sortSummaries(summaries),
  );

  const openGame = (event) => {
    event.preventDefault();

    if (capability.electron) {
      return window.api
        .openGame()
        .then((slug) => slug && navigate(`/games/${slug}/map`));
    }

    if (capability.system) {
      return idb
        .openFilePicker()
        .then((slug) => slug && navigate(`/games/${slug}/map`));
    }

    if (capability.internal) {
      return opfs
        .saveGameFile(event.target.files[0])
        .then((slug) => slug && navigate(`/games/${slug}/map`))
        .catch((e) => dispatch(createAlert("Error", e.message, "error")));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-extrabold">{t("games.title")}</h1>
      <p className="leading-7 my-4 text-wrap">{t("games.description")}</p>
      {(capability.electron || capability.system) && (
        <Button variant="outline" onClick={openGame}>
          <FolderOpen />
          {t("game.open")}
        </Button>
      )}
      {!capability.electron && !capability.system && capability.internal && (
        <Button variant="outline">
          <FolderOpen />
          {t("game.open")}
          <input
            style={{
              bottom: 0,
              clip: "rect(0 0 0 0)",
              clipPath: "inset(50%)",
              height: 1,
              left: 0,
              overflow: "hidden",
              position: "absolute",
              whiteSpace: "nowrap",
              width: 1,
            }}
            type="file"
            onChange={openGame}
            multiple
          />
        </Button>
      )}
      <div className="flex flex-col gap-6 mt-6 flex-wrap max-w-2xl">
        {gameRows}
      </div>
    </div>
  );
};

export default LoadGames;
