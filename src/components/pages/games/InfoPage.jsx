import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";

import { omit } from "ramda";

import {
  ArrowBigRight,
  Copyright,
  Dices,
  Gavel,
  HardDrive,
  Info as InfoIcon,
  Package,
  RefreshCw,
  Trash,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import File from "@/components/File";
import { firstSection } from "@/components/gameNav";
import GameStats from "@/components/pages/games/GameStats";

import { useGame } from "@/hooks";
import { deleteGame, refreshGame } from "@/state";
import { titleToFilename } from "@/util";
import { trackEvent } from "@/util/analytics";
import capability from "@/util/capability";

const InfoPage = () => {
  const game = useGame();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onRefresh = (event) => {
    event.preventDefault();
    trackEvent("refresh", location);
    dispatch(refreshGame());
  };

  const onDelete = (event) => {
    event.preventDefault();
    // Leave the page first, a deleted game still mounted would be reloaded
    navigate("/games");
    dispatch(deleteGame(game.meta.slug, game.info.title)).catch(() =>
      navigate(`/games/${game.meta.slug}`),
    );
  };

  const typeDescription =
    game.meta.type === "bundled"
      ? t("game.type.bundled.description")
      : t("game.type.system.description");
  const TypeIcon = game.meta.type === "bundled" ? Package : HardDrive;

  return (
    <div className="p-4" data-testid={`game-${game.meta.slug}`}>
      <h1 className="text-4xl font-extrabold">{game.info.title}</h1>
      {game.info.subtitle && (
        <h2 className="text-2xl font-extrabold">{game.info.subtitle}</h2>
      )}
      <h3 className="text-1xl font-bold">
        {t("game.by")} {game.info.designer}
      </h3>
      <div className="px-4 border rounded-xl my-4 max-w-lg">
        {game.players && (
          <div className="flex flex-row gap-4 my-4">
            <Users className="text-info" />
            <p>{`${game.players[0].number} - ${game.players[game.players.length - 1].number} ${t("game.players")}`}</p>
          </div>
        )}
        {game.links && game.links.license && (
          <a
            href={game.links.license}
            target="_blank"
            rel="noreferrer"
            className="block flex flex-row gap-4 my-4 justify-start items-center"
          >
            <Copyright className="text-warning" />
            <p>{t("game.license.primary")}</p>
            <p className="italic">{t("game.license.secondary")}</p>
          </a>
        )}
        {game.links && game.links.purchase && (
          <a
            href={game.links.purchase}
            target="_blank"
            rel="noreferrer"
            className="block flex flex-row gap-4 my-4 hover:underline justify-start items-center"
          >
            <Wallet className="text-error" />
            <p>{t("game.purchase.primary")}</p>
            <p className="italic">{t("game.purchase.secondary")}</p>
          </a>
        )}
        {game.links && game.links.bgg && (
          <a
            href={game.links.bgg}
            target="_blank"
            rel="noreferrer"
            className="block flex flex-row gap-4 my-4 hover:underline justify-start items-center"
          >
            <Dices className="text-success" />
            {t("game.bgg")}
          </a>
        )}
        {game.links && game.links.rules && (
          <a
            href={game.links.rules}
            target="_blank"
            rel="noreferrer"
            className="block flex flex-row gap-4 my-4 hover:underline justify-start items-center"
          >
            <Gavel className="text-success" />
            {t("game.rules")}
          </a>
        )}
        {game.prototype && (
          <div className="flex flex-row gap-4 my-4 justify-start items-center">
            <InfoIcon className="text-info" />
            <p>{t("prototype.prototype")}</p>
            <p>{t("prototype.description")}</p>
          </div>
        )}
        {game.wip && (
          <div className="flex flex-row gap-4 my-4 justify-start items-center">
            <InfoIcon className="text-warning" />
            <p>{t("wip.wip")}</p>
            <p>{t("wip.description")}</p>
          </div>
        )}
      </div>
      <div className="flex flex-row justify-start items-center gap-4">
        <Button variant="outline" asChild>
          <Link to={`/games/${game.meta.slug}/${firstSection(game)}`}>
            <ArrowBigRight />
            {t("nav.edit")}
          </Link>
        </Button>
        <File
          data={omit(["meta"], game)}
          filename={`${titleToFilename(game.info.title)}.json`}
        />
        {!capability.electron && game.meta.type === "system" && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw />
            {t("refresh.refresh")}
          </Button>
        )}
      </div>
      <GameStats />
      <div className="flex flex-row gap-4 mt-16 mb-4">
        <TypeIcon />
        <p>{typeDescription}</p>
      </div>
      {game.meta.type !== "bundled" && (
        <Button variant="destructive" onClick={onDelete}>
          <Trash />
          {t("game.type.system.forget")}
        </Button>
      )}
    </div>
  );
};

export default InfoPage;
