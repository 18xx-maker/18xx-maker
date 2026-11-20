import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import NotesPanel from "@/components/play/NotesPanel";
import PlayMap, { sameToken } from "@/components/play/PlayMap";
import PlayMarket, { MarketPanel } from "@/components/play/PlayMarket";
import Presence from "@/components/play/Presence";
import TilePanel from "@/components/play/TilePanel";
import TokenPanel from "@/components/play/TokenPanel";
import TrayPanel from "@/components/play/TrayPanel";

import GameContext from "@/context/GameContext";
import { MapOrientation } from "@/context/OrientationContext";
import { useConfig } from "@/hooks";
import { supply as countSupply } from "@/play/history";
import { cn } from "@/util/cn";

const TABS = ["tiles", "tokens", "market", "trays", "notes"];
const STATUSES = ["connecting", "online", "offline"];

const Board = ({ play }) => {
  const { t } = useTranslation();
  const { config } = useConfig();
  const { game, state, locked, send } = play;
  const [tab, setTab] = useState("tiles");
  const [tile, setTile] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [company, setCompany] = useState(null);
  const [marker, setMarker] = useState(null);
  // { hex } or { hex, token } for a placed token
  const [selected, setSelected] = useState(null);
  const supply = useMemo(() => countSupply(game, state), [game, state]);

  const onTap = ({ hex, x, y, token }) => {
    if (tab === "tokens" && token) {
      setSelected({ hex, token });
      return;
    }
    setSelected({ hex });
    if (locked) return;
    if (tab === "tiles" && tile) {
      send({ type: "tile.place", hex, tile, rotation });
      setTile(null);
    } else if (tab === "tokens" && company && x !== undefined) {
      send({ type: "token.place", hex, token: company, x, y });
    }
  };

  const onMove = (cell) => {
    if (locked || !marker) return;
    send({ type: "market.move", marker, cell });
  };

  // The selected token while it is still on the map
  const token =
    selected?.token &&
    (state.tokens[selected.hex] || []).find((tk) =>
      sameToken(tk, selected.token),
    );

  const status = locked
    ? "locked"
    : STATUSES.includes(play.status)
      ? play.status
      : "connecting";

  return (
    <div
      data-testid="play-board"
      className="flex h-[calc(100dvh-6rem)] min-h-96 flex-col gap-2"
    >
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">{game.info?.title}</h1>
        <Badge variant={status === "online" ? "secondary" : "outline"}>
          {t(`play.board.status.${status}`)}
        </Badge>
        <Presence presence={play.presence} seats={play.seats} />
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-2 md:flex-row">
        {/* The map stays mounted under the market, keeping its view */}
        <div
          className={cn(
            "min-h-64 flex-1 overflow-hidden rounded-md border",
            tab === "market" && "hidden",
          )}
        >
          <PlayMap
            game={game}
            config={config}
            state={state}
            selected={
              tab === "tokens" ? selected : selected && { hex: selected.hex }
            }
            onTap={onTap}
          />
        </div>
        {tab === "market" && (
          <div className="min-h-64 flex-1 overflow-hidden rounded-md border">
            <PlayMarket
              game={game}
              config={config}
              state={state}
              chosen={marker}
              onMove={onMove}
            />
          </div>
        )}
        <aside className="flex w-full flex-col gap-2 overflow-y-auto md:w-80">
          <div
            role="tablist"
            aria-label={t("play.board.panel")}
            className="flex gap-1"
          >
            {TABS.map((name) => (
              <Button
                key={name}
                role="tab"
                id={`play-tab-${name}`}
                aria-selected={tab === name}
                aria-controls="play-tab-panel"
                variant={tab === name ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTab(name)}
              >
                {t(`play.board.tabs.${name}`)}
              </Button>
            ))}
          </div>
          <div
            role="tabpanel"
            id="play-tab-panel"
            aria-labelledby={`play-tab-${tab}`}
          >
            {tab === "tiles" && (
              <TilePanel
                game={game}
                supply={supply.tiles}
                chosen={tile}
                rotation={rotation}
                onChoose={setTile}
                onRotation={setRotation}
                hex={selected?.hex}
                placed={selected && state.tiles[selected.hex]}
                locked={locked}
                send={send}
              />
            )}
            {tab === "tokens" && (
              <TokenPanel
                game={game}
                supply={supply.tokens}
                chosen={company}
                onChoose={setCompany}
                selected={token ? { hex: selected.hex, token } : null}
                locked={locked}
                send={send}
              />
            )}
            {tab === "market" && (
              <MarketPanel
                game={game}
                chosen={marker}
                onChoose={setMarker}
                locked={locked}
              />
            )}
            {tab === "trays" && (
              <TrayPanel
                game={game}
                tiles={Object.keys(supply.tiles)}
                seats={play.seats || []}
                trays={state.trays}
                locked={locked}
                send={send}
              />
            )}
            {tab === "notes" && (
              <NotesPanel notes={state.notes} locked={locked} send={send} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

// The board of an online game: the map with the placed tiles and tokens, the
// tools to place them and who is here. `play` is what usePlayGame gives.
const PlayBoard = ({ play }) => {
  const value = useMemo(
    () => ({ game: play.game, config: play.config }),
    [play.game, play.config],
  );
  return (
    <GameContext.Provider value={value}>
      <MapOrientation>
        <Board play={play} />
      </MapOrientation>
    </GameContext.Provider>
  );
};

export default PlayBoard;
