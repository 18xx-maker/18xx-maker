import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

import GameType from "@/components/pages/load/GameType";

import { publishers } from "@/data";
import { deleteGame } from "@/state";

const GameRow = ({ game }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  let imageNode = null;

  if (game.publisher && publishers[game.publisher]) {
    let publisher = publishers[game.publisher];

    if (game.publisher !== "self") {
      if (publisher.link) {
        imageNode = (
          <div className="flex flex-row place-content-center p-1 border rounded-lg w-16 h-16 shrink-0 overflow-hidden bg-white">
            <a
              className="block h-full w-full"
              rel="noreferrer"
              target="_blank"
              href={publisher.link}
            >
              <img
                className="block h-full w-full object-contain"
                alt={`${publisher.name} Logo`}
                src={publisher.imageUrl}
              />
            </a>
          </div>
        );
      } else {
        imageNode = (
          <div className="border rounded-lg w-16 h-16 shrink-0 overflow-hidden bg-white">
            <img
              className="block h-full w-full object-contain"
              alt={`${publisher.name} Logo`}
              src={publisher.imageUrl}
            />
          </div>
        );
      }
    }
  }

  return (
    <div className="flex flex-row gap-3 justify-between border rounded-xl p-4">
      <div className="min-w-0">
        <div className="text-xl font-bold">
          <Link className="hover:underline" to={`/games/${game.slug}`}>
            {game.title}
          </Link>
        </div>
        {game.subtitle && <div className="text-base">{game.subtitle}</div>}
        {game.designer && (
          <div className="italic text-sm mt-1">
            {t("game.by")} {game.designer}
          </div>
        )}
        <GameType type={game.type} className="mt-2" />
        {/* A game that can not be loaded can not open its page to forget it */}
        {game.type !== "bundled" && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() =>
              dispatch(deleteGame(game.slug, game.title)).catch(() => undefined)
            }
          >
            {t("game.type.system.forget")}
          </Button>
        )}
      </div>
      {imageNode}
    </div>
  );
};

export default GameRow;
