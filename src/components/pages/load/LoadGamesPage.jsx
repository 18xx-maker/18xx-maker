import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import {
  any,
  ascend,
  chain,
  compose,
  filter,
  map,
  partition,
  prop,
  sortBy,
  sortWith,
  uniq,
  values,
} from "ramda";

import { FolderOpen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import GameFilters from "@/components/pages/load/GameFilters";
import GameRow from "@/components/pages/load/GameRow";

import { publishers } from "@/data";
import { useNavigate } from "@/router";
import { createAlert, loadSummaries } from "@/state";
import capability from "@/util/capability";
import { newGameFilename, newGameJson } from "@/util/newGame";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";
import { isTestGame } from "@/util/testGames";

const sortSummaries = compose(sortBy(prop("title")), chain(values), values);

// Designer is free text: "A, B and C" is three designers
export const splitDesigners = (designer) =>
  designer
    ? designer
        .split(/\s*,\s*|\s+and\s+/)
        .map((d) => d.trim())
        .filter(Boolean)
    : [];

// "Ann Lee" sorts under "lee", ties fall back to the full name
const lastName = (name) => name.toLowerCase().split(/\s+/).pop();

const isLoaded = (game) => game.type !== "bundled";

const LoadGamesPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const summaries = useSelector((state) => state.summaries);
  const navigate = useNavigate();

  // Load all summaries
  useEffect(() => {
    dispatch(loadSummaries());
  }, [dispatch]);

  const [publisher, setPublisher] = useState("all");
  const [designer, setDesigner] = useState("all");
  const [type, setType] = useState("all");

  const sorted = useMemo(() => sortSummaries(summaries), [summaries]);
  const hasLoaded = any(isLoaded, sorted);

  const publisherOptions = useMemo(
    () =>
      sortWith(
        [ascend((o) => o[1].toLowerCase())],
        map(
          (id) => [id, publishers[id]?.name ?? id],
          uniq(
            filter(
              (id) => id && id !== "self",
              map((game) => game.publisher, sorted),
            ),
          ),
        ),
      ),
    [sorted],
  );
  const designerOptions = useMemo(
    () =>
      sortWith(
        [ascend((d) => lastName(d)), ascend((d) => d.toLowerCase())],
        uniq(chain((game) => splitDesigners(game.designer), sorted)),
      ),
    [sorted],
  );

  const [loaded, notLoaded] = partition(
    isLoaded,
    filter(
      (game) =>
        (publisher === "all" || game.publisher === publisher) &&
        (designer === "all" ||
          splitDesigners(game.designer).includes(designer)) &&
        (type === "all" || (type === "loaded") === isLoaded(game)),
      sorted,
    ),
  );
  // Test games are not real games, so they go last
  const [testGames, bundled] = partition(
    (game) => isTestGame(game.id),
    notLoaded,
  );

  const section = (heading, games) =>
    games.length > 0 && (
      <section className="mt-6">
        {heading && <h2 className="text-2xl font-bold mb-4">{heading}</h2>}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {map(
            (game) => (
              <GameRow game={game} key={game.slug} />
            ),
            games,
          )}
        </div>
      </section>
    );

  const openGame = (event) => {
    event.preventDefault();

    let opened;
    if (capability.electron) {
      opened = window.api.openGame();
    } else if (capability.system) {
      opened = idb.openFilePicker();
    } else if (capability.internal) {
      opened = opfs.saveGameFile(event.target.files[0]);
    } else {
      return;
    }

    return opened
      .then((slug) => slug && navigate(`/games/${slug}/map`))
      .catch((e) =>
        dispatch(createAlert(t("alerts.error"), e.message, "error")),
      );
  };

  // Where the new game is saved depends on what the browser can do. The
  // picker has to open straight from the click (a user gesture), so the
  // storage call is the first thing the handler does.
  const canCreate =
    capability.electron ||
    (capability.system && capability.apis.save_file_picker) ||
    capability.internal;

  const newGame = () => {
    const title = t("game.new");
    let created;

    if (capability.electron) {
      created = window.api.newGame(title);
    } else if (capability.system && capability.apis.save_file_picker) {
      created = idb.createGameFile(
        newGameJson(title),
        `${newGameFilename(title)}.json`,
      );
    } else {
      created = opfs.saveGameFile(newGameJson(title));
    }

    return created
      .then((slug) => slug && navigate(`/games/${slug}/map`))
      .catch((e) =>
        dispatch(createAlert(t("alerts.error"), e.message, "error")),
      );
  };

  return (
    <div className="p-4" data-testid="games">
      <h1 className="text-4xl font-extrabold">{t("games.title")}</h1>
      <p className="leading-7 my-4 text-wrap">{t("games.description")}</p>
      <div className="flex flex-wrap gap-2">
        {canCreate && (
          // primary-foreground is the purple accent of links, too faint on the
          // primary background
          <Button className="text-background" onClick={newGame}>
            <Plus />
            {t("game.new")}
          </Button>
        )}
        {(capability.electron || capability.system) && (
          <Button variant="outline" onClick={openGame}>
            <FolderOpen />
            {t("game.open")}
          </Button>
        )}
        {!capability.electron && !capability.system && capability.internal && (
          <Button variant="outline" asChild>
            <label className="cursor-pointer">
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
                aria-label={t("game.open")}
                onChange={openGame}
                multiple
              />
            </label>
          </Button>
        )}
      </div>
      <GameFilters
        publisher={publisher}
        setPublisher={setPublisher}
        publishers={publisherOptions}
        designer={designer}
        setDesigner={setDesigner}
        designers={designerOptions}
        type={type}
        setType={setType}
        showType={hasLoaded}
      />
      {section(t("games.loaded"), loaded)}
      {section(hasLoaded ? t("games.bundled") : null, bundled)}
      {section(t("games.test"), testGames)}
      {loaded.length === 0 &&
        bundled.length === 0 &&
        testGames.length === 0 && <p className="mt-6">{t("games.empty")}</p>}
    </div>
  );
};

export default LoadGamesPage;
