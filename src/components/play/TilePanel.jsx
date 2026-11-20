import { memo } from "react";
import { useTranslation } from "react-i18next";

import { RotateCcw, RotateCw, Trash2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

import Tile from "@/components/Tile";
import Svg from "@/components/svg/Svg";

import { cn } from "@/util/cn";

const PreviewView = ({ id, game, rotation = 0, className }) => (
  <Svg viewBox="-90 -90 180 180" className={className} aria-hidden="true">
    <g transform={`rotate(${60 * rotation})`}>
      <Tile id={id} gameTiles={game.tiles} border />
    </g>
  </Svg>
);
const Preview = memo(PreviewView);

const NoneLeft = () => {
  const { t } = useTranslation();
  return (
    <TriangleAlert
      role="img"
      aria-label={t("play.board.tiles.noneLeft")}
      className="size-4 shrink-0 text-destructive"
    />
  );
};

// The tiles tab: the tiles of the game with how many are left, the chosen
// tile and its rotation, and the tile of the selected hex. Going over the
// supply warns and still places.
const TilePanel = ({
  game,
  supply,
  chosen,
  rotation,
  onChoose,
  onRotation,
  hex,
  placed,
  locked,
  send,
}) => {
  const { t } = useTranslation();
  const over = chosen && supply[chosen]?.left <= 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {t("play.board.tiles.hint")}
      </p>

      {chosen && (
        <div className="flex items-center gap-2">
          <Preview
            id={chosen}
            game={game}
            rotation={rotation}
            className="size-16"
          />
          <div className="flex flex-col gap-1">
            <span className="text-sm">
              {t("play.board.tiles.rotation", { degrees: rotation * 60 })}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                aria-label={t("play.board.tiles.rotateLeft")}
                onClick={() => onRotation((rotation + 5) % 6)}
              >
                <RotateCcw />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={t("play.board.tiles.rotateRight")}
                onClick={() => onRotation((rotation + 1) % 6)}
              >
                <RotateCw />
              </Button>
            </div>
          </div>
        </div>
      )}
      {over && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <TriangleAlert className="size-4 shrink-0" />
          {t("play.board.tiles.overSupply")}
        </p>
      )}

      {hex && (
        <div className="flex flex-col gap-2 rounded-md border p-2">
          <span className="text-sm font-medium">
            {placed
              ? t("play.board.tiles.hex", { hex, tile: placed.tile })
              : t("play.board.tiles.empty", { hex })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={locked || !placed}
              onClick={() =>
                send({
                  type: "tile.rotate",
                  hex,
                  rotation: (placed.rotation + 1) % 6,
                })
              }
            >
              <RotateCw />
              {t("play.board.tiles.rotate")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={locked || !placed}
              onClick={() => send({ type: "tile.remove", hex })}
            >
              <Trash2 />
              {t("play.board.tiles.remove")}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1">
        {Object.entries(supply).map(([id, count]) => (
          <Button
            key={id}
            variant="outline"
            data-tile-option={id}
            aria-pressed={chosen === id}
            disabled={locked}
            onClick={() => onChoose(chosen === id ? null : id)}
            className={cn(
              "h-auto justify-start p-1 text-left",
              chosen === id && "border-primary bg-accent",
            )}
          >
            <Preview id={id} game={game} className="size-10! shrink-0" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate">{id}</span>
              <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                {t("play.board.tiles.left", { count: count.left })}
                {count.left <= 0 && <NoneLeft />}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TilePanel;
