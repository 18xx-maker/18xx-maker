import { describe, expect, it } from "vitest";

import Market from "@/components/market/Market";
import Par from "@/components/market/Par";

import { companyThemes, games, mapThemes } from "@/data";
import { useConfig, useGame } from "@/hooks";
import { getMarketData, getParData } from "@/util/market";

import { all, attr, drawSvg, one } from "@tests/support/render.jsx";

const gmt = mapThemes.gmt.colors;
const rob = companyThemes.rob.colors;

const StockMarket = ({ displayTitle }) => {
  const { config } = useConfig();
  const game = useGame();
  return (
    <Market
      data={getMarketData(game.stock, config)}
      game={game}
      config={config}
      title={game.info.title}
      displayTitle={displayTitle}
    />
  );
};

const StockPar = ({ title }) => {
  const { config } = useConfig();
  const game = useGame();
  return <Par title={title} data={getParData(game.stock, config)} />;
};

const withStock = (stock) => ({ ...games["18Test"], stock });

// Top level cell groups, in render order (bottom cells first)
const cellGroups = (svg) =>
  all(svg, "svg > g > g[transform^='translate']").filter((g) =>
    g.querySelector(":scope > g > rect"),
  );

const legend = [
  { color: "red", description: "First legend" },
  { color: "green", description: "Second" },
];

describe("1D market", () => {
  const stock = {
    type: "1D",
    title: false,
    legend,
    market: [
      "Closed",
      10,
      {
        value: 20,
        bottom: true,
        color: "red",
        labelColor: "white",
        underline: true,
        subLabel: "sub",
        arrow: ["up", "down", "left", "right", "around"],
        companies: ["BLRR", { abbrev: "BRR", row: 2 }, { abbrev: "NOPE" }],
        tokens: [{ label: "T1" }, { company: "BRR", y: 3 }],
      },
      { value: 30, legend: 1 },
      { value: 40, par: true },
      false,
    ],
  };

  it("lays cells out in a row with bottom cells drawn first", async () => {
    const svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    const groups = cellGroups(svg);
    // Five drawable cells (false is skipped)
    expect(groups).toHaveLength(5);
    // The bottom cell is drawn first even though it is the third cell
    expect(groups[0]).toHaveAttribute("transform", "translate(140 0)");
    expect(groups[1]).toHaveAttribute("transform", "translate(0 0)");
    // 1D cells are a column of 4 cells high
    expect(one(groups[1], "rect")).toHaveAttribute("height", "340");
  });

  it("rotates labels and draws strings as labels", async () => {
    const svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    const closed = all(svg, "text").find((t) => t.textContent === "Closed");
    expect(closed).toHaveAttribute("transform", "rotate(-90)");
    expect(closed).toHaveAttribute("text-anchor", "end");
    expect(closed).toHaveAttribute("x", "-5");
  });

  it("draws arrows, companies, tokens and colors for a cell", async () => {
    const svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    const [cell] = cellGroups(svg);
    expect(one(cell, "rect")).toHaveAttribute("fill", gmt.red);

    const texts = all(cell, "text");
    const value = texts.find((t) => t.textContent === "20");
    expect(value).toHaveAttribute("fill", "white");
    expect(value).toHaveAttribute("text-decoration", "underline");
    expect(texts.find((t) => t.textContent === "sub")).toBeDefined();

    const arrows = texts.filter((t) => /^[↑↓←→↻]$/.test(t.textContent));
    expect(arrows.map((t) => t.textContent)).toEqual(["↑", "↓", "←", "→", "↻"]);
    expect(arrows.map((t) => t.getAttribute("text-anchor"))).toEqual([
      "end",
      "start",
      "start",
      "end",
      "end",
    ]);
    // Vertical arrows sit higher off the bottom than horizontal ones
    expect(arrows.map((t) => t.getAttribute("y"))).toEqual([
      "330",
      "330",
      "335",
      "335",
      "335",
    ]);

    // Known companies get a labelled bar per row, unknown ones are skipped
    const bars = all(cell, "rect[rx='2']");
    expect(attr(cell, "rect[rx='2']", "y")).toEqual(["319", "298"]);
    expect(bars[0]).toHaveAttribute("fill", rob.black);
    expect(bars[0]).toHaveAttribute("height", "16");
    expect(texts.map((t) => t.textContent)).toEqual(
      expect.arrayContaining(["BLRR", "BRR", "T1"]),
    );
  });

  it("colors legend and par cells", async () => {
    const svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    const groups = cellGroups(svg);
    expect(one(groups[3], "rect")).toHaveAttribute("fill", gmt.green);
    expect(one(groups[4], "rect")).toHaveAttribute("fill", gmt.gray);
  });

  it("lays the legend out in a row below the market", async () => {
    const svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    const legends = all(svg, "g[transform] > g > circle[r='12']").map(
      (c) => c.parentElement.parentElement,
    );
    expect(attr(svg, "circle[r='12']", "fill")).toEqual([gmt.red, gmt.green]);
    // Each entry moves right by 100 plus 6.5 per description character
    expect(legends.map((g) => g.getAttribute("transform"))).toEqual([
      "translate(0 365)",
      "translate(178 365)",
    ]);
  });

  it("hides the legend when configured", async () => {
    const svg = await drawSvg(<StockMarket />, {
      game: withStock(stock),
      search: "?config.stock.display.legend=",
    });
    expect(one(svg, "circle[r='12']")).toBeNull();
  });

  it("moves values to the bottom when configured", async () => {
    const svg = await drawSvg(<StockMarket />, {
      game: withStock(stock),
      search: "?config.stock.value=bottom&config.stock.arrows=top",
    });
    const [cell, closedCell] = cellGroups(svg);
    const texts = all(cell, "text");
    // Unrotated values move to the bottom right corner
    const value = texts.find((t) => t.textContent === "20");
    expect(value).toHaveAttribute("x", "65");
    expect(value).toHaveAttribute("y", "335");
    expect(value).toHaveAttribute("text-anchor", "end");
    // Rotated labels start from the bottom of the cell
    const closed = one(closedCell, "text");
    expect(closed).toHaveAttribute("x", "-335");
    expect(closed).toHaveAttribute("y", "65");
    expect(closed).toHaveAttribute("text-anchor", "start");
    // Rotated sub labels end at the top
    const sub = texts.find((t) => t.textContent === "sub");
    expect(sub).toHaveAttribute("x", "-5");
    expect(sub).toHaveAttribute("text-anchor", "end");
    // Arrows at the top hang from it
    const up = texts.find((t) => t.textContent === "↑");
    expect(up).toHaveAttribute("y", "5");
    expect(up).toHaveAttribute("dominant-baseline", "hanging");
  });
});

describe("1Diag market", () => {
  const stock = {
    type: "1Diag",
    legend,
    display: { legend: { x: 10, y: 400 } },
    market: [10, 20, { value: 30, bottom: true }, 40],
  };

  it("zig zags cells between two rows", async () => {
    const svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    const transforms = cellGroups(svg).map((g) => g.getAttribute("transform"));
    // Bottom cell (index 2) first, then the rest. Odd cells drop a row of
    // diag (2) cells and each cell moves half a cell right.
    expect(transforms).toEqual([
      "translate(70 50)",
      "translate(0 50)",
      "translate(35 220)",
      "translate(105 220)",
    ]);
    expect(one(svg, "text")).toHaveTextContent("18Test Stock Market");
  });

  it("places the legend where the game says", async () => {
    const svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    const legends = all(svg, "circle[r='12']").map(
      (c) => c.parentElement.parentElement,
    );
    expect(legends.map((g) => g.getAttribute("transform"))).toEqual([
      "translate(10 400)",
      "translate(188 400)",
    ]);
  });

  it("defaults the legend below the market", async () => {
    const svg = await drawSvg(<StockMarket />, {
      game: withStock({ ...stock, title: false, display: {} }),
    });
    const legend = one(svg, "circle[r='12']").parentElement.parentElement;
    expect(legend).toHaveAttribute("transform", "translate(0 365)");
  });
});

describe("2D market", () => {
  const stock = {
    type: "2D",
    cell: { color: "yellow" },
    par: { color: "orange", values: [100, 90] },
    legend,
    display: {
      legend: {
        x: 2,
        y: 1,
        reverse: true,
        align: "right",
        verticalAlign: "bottom",
      },
      par: { x: 3, y: 0 },
      roundTracker: { x: 0, y: 1 },
    },
    ledges: [
      {
        coords: ["0 0", "1 0", "1 1"],
        color: "red",
        border: true,
        dashed: true,
        offset: 2,
      },
      {
        coords: ["2 0", "2 1"],
        color: "blue",
        width: 5,
        dashed: true,
        dashArray: "4 1",
      },
    ],
    market: [
      [
        {
          value: 50,
          label: "50",
          subLabel: "s",
          rotated: true,
          subRotated: true,
        },
        { value: 60, par: true },
      ],
      [null, { label: "X", legend: 9 }],
    ],
  };

  it("uses the market and par colors", async () => {
    const svg = await drawSvg(<StockMarket displayTitle={false} />, {
      game: withStock(stock),
    });
    const groups = cellGroups(svg);
    expect(one(groups[0], "rect")).toHaveAttribute("fill", gmt.yellow);
    expect(one(groups[1], "rect")).toHaveAttribute("fill", gmt.orange);
    // Out of range legends fall back to the market color
    expect(one(groups[2], "rect")).toHaveAttribute("fill", gmt.yellow);
    expect(svg).not.toHaveTextContent("Stock Market");
  });

  it("rotates labels only when asked", async () => {
    const svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    const texts = all(svg, "text");
    const rotated = texts.find((t) => t.textContent === "50");
    expect(rotated).toHaveAttribute("transform", "rotate(-90)");
    const sub = texts.find((t) => t.textContent === "s");
    expect(sub).toHaveAttribute("x", "-80");
    expect(sub).toHaveAttribute("y", "65");
    const plain = texts.find((t) => t.textContent === "X");
    expect(plain).not.toHaveAttribute("transform");
  });

  it("draws a reversed legend aligned to the bottom right", async () => {
    const svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    const circles = all(svg, "circle[r='12']");
    expect(circles.map((c) => c.getAttribute("fill"))).toEqual([
      gmt.green,
      gmt.red,
    ]);
    expect(circles[0]).toHaveAttribute("cx", "-20");
    expect(circles[0]).toHaveAttribute("cy", "-20");
    expect(
      circles.map((c) =>
        c.parentElement.parentElement.getAttribute("transform"),
      ),
    ).toEqual(["translate(140 135)", "translate(140 100)"]);
    const text = all(svg, "text").find((t) => t.textContent === "Second");
    expect(text).toHaveAttribute("text-anchor", "end");
  });

  it("draws the par chart on the market", async () => {
    const svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    const title = all(svg, "text").find((t) => t.textContent === "Par");
    expect(title.parentElement.parentElement).toHaveAttribute(
      "transform",
      "translate(210 50)",
    );
  });

  it("draws the round tracker on the market only when configured", async () => {
    let svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    expect(svg).toHaveTextContent("OR3");
    svg = await drawSvg(<StockMarket />, {
      game: withStock(stock),
      search: "?config.stock.display.roundTracker=",
    });
    expect(svg).not.toHaveTextContent("OR3");
  });

  it("draws ledges with borders and dashes", async () => {
    const svg = await drawSvg(<StockMarket />, { game: withStock(stock) });
    const ledges = all(svg, "path").filter((p) =>
      p.getAttribute("d").startsWith("M "),
    );
    const [border, red, blue] = ledges;
    expect(border).toHaveAttribute("d", "M 0 50 L 70 50 L 70 135");
    expect(border).toHaveAttribute("stroke", gmt.track);
    expect(border).toHaveAttribute("stroke-width", "5");
    expect(red).toHaveAttribute("stroke", rob.red);
    expect(red).toHaveAttribute("stroke-dasharray", "7.5");
    expect(red).toHaveAttribute("stroke-dashoffset", "2");
    expect(blue).toHaveAttribute("stroke-dasharray", "4 1");
    expect(blue).toHaveAttribute("stroke-dashoffset", "0");
  });

  it("puts arrows in the middle when configured", async () => {
    const svg = await drawSvg(<StockMarket />, {
      game: withStock({ ...stock, market: [[{ value: 1, arrow: "up" }]] }),
      search: "?config.stock.arrows=middle",
    });
    const arrow = all(svg, "text").find((t) => t.textContent === "↑");
    expect(arrow).toHaveAttribute("y", "42.5");
    expect(arrow).toHaveAttribute("dominant-baseline", "middle");
  });

  it("swaps unrotated values and sub labels when values go at the bottom", async () => {
    const svg = await drawSvg(<StockMarket />, {
      game: withStock({ ...stock, market: [[{ value: 1, subLabel: "s" }]] }),
      search: "?config.stock.value=bottom",
    });
    const [value, sub] = all(cellGroups(svg)[0], "text");
    expect(value).toHaveAttribute("x", "65");
    expect(value).toHaveAttribute("y", "80");
    expect(value).toHaveAttribute("text-anchor", "end");
    expect(sub).toHaveAttribute("x", "5");
    expect(sub).toHaveAttribute("dominant-baseline", "hanging");
  });

  it("draws 2D company bars without labels", async () => {
    const svg = await drawSvg(<StockMarket />, {
      game: withStock({
        ...stock,
        market: [[{ value: 1, companies: ["BLRR"] }]],
      }),
    });
    const bar = one(svg, "rect[rx='2']");
    expect(bar).toHaveAttribute("height", "8");
    expect(bar).toHaveAttribute("y", "72");
    expect(svg).not.toHaveTextContent("BLRR");
  });
});

describe("Par", () => {
  const stock = {
    par: {
      title: false,
      values: [
        [
          100,
          "Label",
          {
            value: 80,
            legend: 0,
            labelColor: "red",
            underline: true,
            subLabel: "sub",
          },
        ],
        90,
        [{ label: "", color: "green" }, null],
      ],
    },
    legend,
  };

  it("lays par cells out by row and column", async () => {
    const svg = await drawSvg(<StockPar title="Par chart" />, {
      game: withStock(stock),
    });
    const transforms = attr(svg, "g[transform^='translate']", "transform");
    expect(transforms).toEqual([
      "translate(0 0)",
      "translate(280 0)",
      "translate(560 0)",
      "translate(0 85)",
      "translate(0 170)",
    ]);
    expect(one(svg, "text")).toHaveTextContent("Par chart");
  });

  it("colors and labels par cells", async () => {
    const svg = await drawSvg(<StockPar />, { game: withStock(stock) });
    const rects = all(svg, "rect");
    expect(rects.map((r) => r.getAttribute("fill"))).toEqual([
      gmt.gray,
      gmt.gray,
      gmt.red,
      gmt.gray,
      gmt.green,
    ]);
    // Par cells are 4 cells wide by default
    expect(rects[0]).toHaveAttribute("width", "280");
    const texts = all(svg, "text");
    expect(texts.map((t) => t.textContent)).toEqual([
      "100",
      "Label",
      "80",
      "sub",
      "90",
    ]);
    expect(texts[2]).toHaveAttribute("fill", "red");
    expect(texts[2]).toHaveAttribute("text-decoration", "underline");
    expect(texts[3]).toHaveAttribute("y", "80");
  });

  it("uses the par color from the game", async () => {
    const svg = await drawSvg(<StockPar />, {
      game: withStock({ par: { color: "orange", values: [100] } }),
    });
    expect(one(svg, "rect")).toHaveAttribute("fill", gmt.orange);
    // Titled par charts leave room for the title
    expect(one(svg, "g[transform^='translate']")).toHaveAttribute(
      "transform",
      "translate(0 50)",
    );
  });
});
