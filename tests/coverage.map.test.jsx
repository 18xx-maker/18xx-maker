import { describe, expect, it } from "vitest";

import Map from "@/components/map/Map";

import { companyThemes, games, mapThemes } from "@/data";
import { useConfig, useGame } from "@/hooks";

import { all, attr, drawSvg, one } from "@tests/coverage.render.jsx";

const gmt = mapThemes.gmt.colors;
const rob = companyThemes.rob.colors;
const base = games["18Test"];

const MapView = ({ variation }) => {
  const { config } = useConfig();
  const game = useGame();
  return <Map name="test" game={game} config={config} variation={variation} />;
};

const withMap = (map, info = {}) => ({
  ...base,
  info: { ...base.info, ...info },
  map,
});
const hexes = base.map.hexes;
const plainHexes = [{ color: "plain", hexes: ["A1", "A3"] }];
// Map lines and borders are paths through hex points
const mapPaths = (svg) =>
  all(svg, "path").filter(
    (p) =>
      p.getAttribute("d").includes(" L ") && p.getAttribute("fill") === "none",
  );

// Coordinate labels across the top of an "outside" coordinate map
const topLabels = (svg) =>
  all(svg, "text[font-size='16'][y='25']").map((t) => t.textContent);

describe("map coordinates", () => {
  it("puts numbers across the top by default", async () => {
    const svg = await drawSvg(<MapView />, { game: withMap({ hexes }) });
    expect(topLabels(svg).slice(0, 3)).toEqual(["1", "2", "3"]);
  });

  it.for(["reversed", "numbersHorizontal", "lettersVertical"])(
    "puts letters across the top when %s",
    async (mapCoordinates) => {
      const svg = await drawSvg(<MapView />, {
        game: withMap({ hexes }, { mapCoordinates }),
      });
      expect(topLabels(svg).slice(0, 3)).toEqual(["A", "B", "C"]);
    },
  );

  it("draws no coordinates for unknown settings", async () => {
    const svg = await drawSvg(<MapView />, {
      game: withMap({ hexes }, { mapCoordinates: "sideways" }),
    });
    expect(all(svg, "text[font-size='16']")).toHaveLength(0);
  });
});

describe("map variations", () => {
  it("names the variation in the title", async () => {
    const game = withMap([
      { name: "Base", hexes },
      { name: "Short", copy: 0, hexes: [] },
    ]);
    let svg = await drawSvg(<MapView variation={1} />, { game });
    expect(svg).toHaveTextContent(`by ${base.info.designer} ⋯ Short`);
    svg = await drawSvg(<MapView variation={0} />, { game });
    expect(svg).not.toHaveTextContent("⋯");
  });
});

describe("map lines and borders", () => {
  it("draws dashed lines with their own border width", async () => {
    const svg = await drawSvg(<MapView />, {
      game: withMap({
        hexes: plainHexes,
        lines: [
          {
            color: "red",
            coords: ["A1p1", "A3p4"],
            dashed: true,
            offset: 3,
            borderWidth: 20,
            width: 4,
          },
          { color: "blue", coords: ["A1p1", "A3p4"], border: false },
        ],
      }),
    });
    const paths = mapPaths(svg);
    const [border, red, blue] = paths;
    expect(paths).toHaveLength(3);
    expect(border).toHaveAttribute("stroke", gmt.track);
    expect(border).toHaveAttribute("stroke-width", "20");
    expect(border).toHaveAttribute("stroke-dasharray", "10");
    expect(border).toHaveAttribute("stroke-dashoffset", "3");
    expect(red).toHaveAttribute("stroke", rob.red);
    expect(blue).toHaveAttribute("stroke", rob.blue);
    expect(blue).toHaveAttribute("stroke-dasharray", "none");
  });

  it("draws dashed borders with dash arrays and offsets", async () => {
    const svg = await drawSvg(<MapView />, {
      game: withMap({
        hexes,
        borders: [
          {
            color: "red",
            coords: ["A1p1", "A3p4"],
            dashed: true,
            dashArray: "5 2",
            offset: 4,
          },
        ],
      }),
    });
    const paths = all(svg, "path[stroke-dasharray='5 2']");
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach((p) => expect(p).toHaveAttribute("stroke-dashoffset", "4"));
    expect(attr(svg, "path[stroke-dasharray='5 2']", "stroke")).toContain(
      rob.red,
    );
  });

  it("draws border labels with game fonts", async () => {
    const svg = await drawSvg(<MapView />, {
      game: withMap(
        {
          hexes,
          borderTexts: [
            { coord: "A1", label: "Ferry", rotation: 30 },
            { coord: "A3" },
          ],
        },
        {
          valueFontSize: 20,
          valueFontWeight: "light",
          valueFontFamily: "serif",
        },
      ),
    });
    const label = all(svg, "text").find((t) => t.textContent === "Ferry");
    expect(label).toHaveAttribute("font-size", "20");
    expect(label).toHaveAttribute("font-weight", "light");
    expect(label).toHaveAttribute("font-family", "serif");
    expect(label).toHaveAttribute("fill", rob.black);
    expect(label.parentElement).toHaveAttribute(
      "transform",
      expect.stringMatching(/rotate\(30\)$/),
    );
    // No circle without a circle size
    expect(one(label.parentElement, "circle")).toBeNull();
  });
});

describe("map extras", () => {
  const extras = {
    hexes,
    market: {},
    players: {},
    roundTracker: {},
  };

  it("places the market, players and round tracker at the origin", async () => {
    const svg = await drawSvg(<MapView />, { game: withMap(extras) });
    const placed = attr(
      svg,
      "svg > g[transform^='translate(50 50)']",
      "transform",
    );
    // Market, round tracker and players all default to the top left
    expect(placed).toEqual([
      "translate(50 50) scale(1)",
      "translate(50 50) scale(1)",
      "translate(50 50)",
    ]);
    // The round tracker shows the rounds
    expect(svg).toHaveTextContent("OR1");
    // The players table shows the bank
    expect(svg).toHaveTextContent("$12,345");
  });

  // Each extra disappears when the config turns it off
  const marketCells = (svg) => all(svg, "rect[width='70'][height='85']");
  it.for([
    ["market", "?config.maps.market=", (svg) => marketCells(svg).length > 0],
    [
      "players",
      "?config.maps.players=",
      (svg) => /\$12,345/.test(svg.textContent),
    ],
    [
      "round tracker",
      "?config.maps.roundTracker=",
      (svg) => /OR1/.test(svg.textContent),
    ],
  ])("hides the %s when configured", async ([, search, present]) => {
    const shown = await drawSvg(<MapView />, { game: withMap(extras) });
    expect(present(shown)).toBe(true);
    const hidden = await drawSvg(<MapView />, {
      game: withMap(extras),
      search,
    });
    expect(present(hidden)).toBe(false);
  });
});
