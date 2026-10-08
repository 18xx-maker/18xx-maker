import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

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
import KeyLabel from "@/components/KeyLabel";
import GameStats from "@/components/pages/games/GameStats";

import { publishers } from "@/data";
import { useGame } from "@/hooks";
import { Link, useNavigate } from "@/router";
import { deleteGame, refreshGame } from "@/state";
import { trackEvent } from "@/util/analytics";
import capability from "@/util/capability";
import { gameFile } from "@/util/download";
import { firstSection } from "@/util/gameNav";

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

  const publisherId = game.info.publisher;
  const publisher = publishers[publisherId];
  const publisherInner = publisher && (
    <>
      {publisherId !== "self" && (
        <div className="flex flex-row place-content-center p-1 border rounded-lg w-16 h-16 shrink-0 overflow-hidden bg-white">
          <img
            className="block h-full w-full object-contain"
            alt={`${publisher.name} Logo`}
            src={publisher.imageUrl}
          />
        </div>
      )}
      <div>
        <p className="text-sm text-muted-foreground">{t("game.publisher")}</p>
        <p className="font-bold">{publisher.name}</p>
      </div>
    </>
  );

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
        {publisher &&
          (publisher.link ? (
            <a
              href={publisher.link}
              target="_blank"
              rel="noreferrer"
              data-testid="game-publisher"
              className="flex flex-row gap-4 my-4 hover:underline justify-start items-center"
            >
              {publisherInner}
            </a>
          ) : (
            <div
              data-testid="game-publisher"
              className="flex flex-row gap-4 my-4 justify-start items-center"
            >
              {publisherInner}
            </div>
          ))}
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
            <span>
              <KeyLabel text={t("nav.edit")} shortcut="e" />
            </span>
          </Link>
        </Button>
        <File {...gameFile(game)} shortcut="d" />
        {!capability.electron && game.meta.type === "system" && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw />
            {t("refresh.refresh")}
          </Button>
        )}
      </div>
      <GameStats />
      <div className="flex flex-row gap-4 mt-4 mb-4">
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
