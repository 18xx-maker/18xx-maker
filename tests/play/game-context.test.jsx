import { describe, expect, it } from "vitest";

import Icon from "@/components/atoms/Icon";
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

  it("draws no custom image of the store's game for the context game", async () => {
    // The store holds the custom images of the open game (18Test)
    const assets = {
      [base.meta.slug]: {
        icons: {
          star: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><rect width='10' height='10'/></svg>",
        },
        logos: {},
        trains: {},
      },
    };
    const own = await drawSvg(<Icon type="custom/star" />, { assets });
    expect(all(own, "rect")).toHaveLength(1);

    const play = await drawSvg(
      <GameContext.Provider value={{ game: other, config: {} }}>
        <Icon type="custom/star" />
      </GameContext.Provider>,
      { assets },
    );
    expect(all(play, "rect")).toHaveLength(0);

    // The context's own images are drawn instead
    const serverAssets = {
      icons: {
        star: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><circle r='5'/></svg>",
      },
      logos: {},
      trains: {},
    };
    const served = await drawSvg(
      <GameContext.Provider
        value={{ game: other, config: {}, assets: serverAssets }}
      >
        <Icon type="custom/star" />
      </GameContext.Provider>,
      { assets },
    );
    expect(all(served, "rect")).toHaveLength(0);
    expect(all(served, "svg circle[r='5']")).toHaveLength(1);
  });
});
