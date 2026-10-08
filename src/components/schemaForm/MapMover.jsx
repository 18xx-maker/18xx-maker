import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useStore } from "react-redux";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

import { clearDrafts } from "@/components/editPanel/draftStore";

import { useLocation, useNavigate } from "@/router";
import { editGame } from "@/state";
import { COORD_PATTERN } from "@/util/hexEdit";
import {
  canShift,
  countLeft,
  moveDelta,
  shiftBounds,
  shiftCoord,
  shiftGame,
} from "@/util/mapShift";

// Where each button sits in the 3 x 3 grid
const DIRECTIONS = [
  { name: "up", Icon: ArrowUp, cell: "col-start-2 row-start-1" },
  { name: "left", Icon: ArrowLeft, cell: "col-start-1 row-start-2" },
  { name: "right", Icon: ArrowRight, cell: "col-start-3 row-start-2" },
  { name: "down", Icon: ArrowDown, cell: "col-start-2 row-start-3" },
];

// Four buttons that move every coordinate of the game by one row or column
// (the Map tab edits the map as a whole, so this is not per variation)
const MapMover = ({ game }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const store = useStore();
  const navigate = useNavigate();
  const { search } = useLocation();
  // The note belongs to the game the move produced
  const [moved, setMoved] = useState({ left: 0, game: null });
  const horizontal = game.info?.orientation === "horizontal";
  const { any } = shiftBounds(game);

  const move = (name) => {
    const { dx, dy } = moveDelta(name, horizontal);
    if (!canShift(game, dx, dy)) return;
    const params = new URLSearchParams(search);
    const hex = params.get("hex") || "";
    const count = countLeft(game, dx, dy);
    dispatch(editGame((latest) => shiftGame(latest, dx, dy)));
    setMoved({ left: count, game: store.getState().game });
    // A draft of a hex group is of the group as it was
    clearDrafts(`${game.meta.slug}#hex:`);
    if (COORD_PATTERN.test(hex)) {
      const moved = shiftCoord(hex, dx, dy);
      if (moved) params.set("hex", moved);
      else params.delete("hex");
      const text = params.toString();
      navigate({ search: text ? `?${text}` : "" }, { replace: true });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        aria-label={t("editPanel.map.move.legend")}
        className="flex flex-col gap-2"
      >
        <span className="text-sm font-medium">
          {t("editPanel.map.move.legend")}
        </span>
        <div className="grid grid-cols-3 gap-1 w-fit">
          {DIRECTIONS.map(({ name, Icon, cell }) => {
            const { dx, dy } = moveDelta(name, horizontal);
            const allowed = canShift(game, dx, dy);
            const title = !allowed
              ? t(
                  any
                    ? `editPanel.map.move.blocked.${dy ? "row" : "column"}`
                    : "editPanel.map.move.empty",
                )
              : undefined;
            return (
              <span key={name} className={cell} title={title}>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!allowed}
                  aria-label={t(`editPanel.map.move.${name}`)}
                  onClick={() => move(name)}
                >
                  <Icon />
                </Button>
              </span>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("editPanel.map.move.hint")}
      </p>
      {moved.game === game && moved.left > 0 && (
        <p role="note" className="text-xs text-muted-foreground">
          {t("editPanel.map.move.unchanged", { count: moved.left })}
        </p>
      )}
    </div>
  );
};

export default MapMover;
