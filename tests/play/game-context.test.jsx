import { describe, expect, it } from "vitest";

import Map from "@/components/map/Map";

import GameContext from "@/context/GameContext";
import { games } from "@/data";
import { useConfig, useGame } from "@/hooks";

import { all, drawSvg } from "@tests/support/render.jsx";

const base = games["18Test"];
const other = {
  ...base,
  info: { ...base.info, title: "Elsewhere Line", designer: "Someone Else" },
  map: { hexes: [{ color: "plain", hexes: ["A1", "A3"] }] },
};

const MapView = () => {
  const { config } = useConfig();
  const game = useGame();
  return <Map name="test" game={game} config={config} />;
};

describe("GameContext", () => {
  it("draws the context game while the store holds another", async () => {
    const svg = await drawSvg(
      <GameContext.Provider value={{ game: other, config: {} }}>
        <MapView />
      </GameContext.Provider>,
    );
    expect(svg).toHaveTextContent("Someone Else");
    const plain = await drawSvg(<MapView />, { game: other });
    expect(all(svg, "g").length).toBe(all(plain, "g").length);
  });

  it("reads the game and config of the context", async () => {
    let seen;
    const Probe = () => {
      seen = { game: useGame(), config: useConfig().config };
      return null;
    };
    await drawSvg(
      <GameContext.Provider
        value={{ game: other, config: { tiles: { mapWidth: 123 } } }}
      >
        <Probe />
      </GameContext.Provider>,
    );
    expect(seen.game).toBe(other);
    expect(seen.config.tiles.mapWidth).toBe(123);
  });

  it("changes nothing without a provider", async () => {
    let seen;
    const Probe = () => {
      seen = useGame();
      return null;
    };
    await drawSvg(<Probe />);
    expect(seen).toBe(base);
  });
});
