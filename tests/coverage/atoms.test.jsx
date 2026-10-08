import { afterEach, describe, expect, it, vi } from "vitest";

import Boomtown from "@/components/atoms/Boomtown";
import Border from "@/components/atoms/Border";
import CenterTown from "@/components/atoms/CenterTown";
import City from "@/components/atoms/City";
import Id from "@/components/atoms/Id";
import MediumCity from "@/components/atoms/MediumCity";
import Terrain from "@/components/atoms/Terrain";
import Track from "@/components/atoms/Track";
import TunnelEntrance from "@/components/atoms/TunnelEntrance";
import Value from "@/components/atoms/Value";
import Shape from "@/components/atoms/shapes/Shape";

import RotateContext from "@/context/RotateContext";
import { companyThemes, mapThemes } from "@/data";

import { all, attr, drawSvg, one, withInfo } from "@tests/support/render.jsx";

const gmt = mapThemes.gmt.colors;
const rob = companyThemes.rob.colors;

const arcRadius = (d) => Number(/A ([-\d.]+)/.exec(d)[1]);
const numbers = (d) => d.match(/-?[\d.]+(e-?\d+)?/g).map(Number);
const close = (n) => expect.closeTo(n, 6);
const moveTo = (d) => /^m ([-\d.e]+) ([-\d.e]+)/.exec(d).slice(1).map(Number);

describe("Track", () => {
  afterEach(() => vi.restoreAllMocks());

  const trackPath = async (props, options) => {
    const svg = await drawSvg(<Track {...props} />, options);
    return attr(svg, "path", "d");
  };

  it("cuts a straight track to its start and end", async () => {
    const [d] = await trackPath({ type: "straight", start: 0.2, end: 0.8 });
    expect(numbers(d)).toEqual([0, 45, 0, -45].map(close));
  });

  it("accepts begin and stop as aliases for start and end", async () => {
    const [d] = await trackPath({ type: "straight", begin: 0.2, stop: 0.8 });
    expect(numbers(d)).toEqual([0, 45, 0, -45].map(close));
  });

  it.for([
    ["straightLeft", -17.15],
    ["straightRight", 17.15],
  ])("offsets %s by a track width", async ([type, x]) => {
    const [d] = await trackPath({ type });
    expect(d).toBe(`m ${x} 85 L ${x} 75 L ${x} -75 L ${x} -85`);
  });

  it.for([
    ["gentle", 0, 129.90375],
    ["gentleInner", -17.15, 112.75375],
    ["gentleOuter", 17.15, 147.05375],
    ["sharp", 0, 43.31025],
    ["sharpInner", -17.15, 26.16025],
    ["sharpOuter", 17.15, 60.46025],
  ])("draws %s as an arc of the right radius", async ([type, x, r]) => {
    const [d] = await trackPath({ type });
    expect(moveTo(d)).toEqual([x, 85]);
    expect(arcRadius(d)).toBeCloseTo(r, 5);
  });

  it("adds the radius offset to arcs", async () => {
    const [d] = await trackPath({ type: "gentle", radiusOffset: 10 });
    expect(arcRadius(d)).toBeCloseTo(139.90375, 5);
  });

  it("starts a partial sharp track part way around the arc", async () => {
    const [d] = await trackPath({ type: "sharp", start: 0.5, end: 0.75 });
    const [x, y] = moveTo(d);
    // Half of a 120° arc of radius 43.31025 from the bottom edge
    expect(x).toBeCloseTo(-43.31025 + 43.31025 * Math.cos(Math.PI / 3), 4);
    expect(y).toBeCloseTo(75 - 43.31025 * Math.sin(Math.PI / 3), 4);
    // The end has no bleed past the hex edge
    expect(d).not.toContain(" L ");
  });

  it.for([
    ["stub", "m 0 85 L 0 56.25", '{"type": "straight", "end": 0.125}'],
    ["stop", "m 0 85 L 0 37.5", '{"type": "straight", "end": 0.25}'],
    [
      "mid",
      "m 0 0 L 0 37.5",
      '{"type": "straight", "start": 0.25, "end": 0.5}',
    ],
    [
      "straightGentleHalf",
      "m 0 85 L 0 20",
      '{"type": "straight", "end": 0.3667}',
    ],
    ["straightStop", "m 0 85 L 0 -37.5", '{"type": "straight", "end": 0.75}'],
    [
      "gentleHalf",
      "m 0 85 L 0 75 A 129.90375 129.90375 0 0 0 -15 15",
      '{"type": "gentle", "end": 0.5}',
    ],
    [
      "gentleStop",
      "m 0 85 L 0 75 A 129.90375 129.90375 0 0 0 -38.047927473438027 -16.855822526561973",
      '{"type": "gentle", "end": 0.75}',
    ],
    [
      "gentleHalfRev",
      "m 0 85 L 0 75 A 129.90375 129.90375 0 0 1 15 15",
      '{"type": "gentle", "end": 0.5}',
    ],
    [
      "gentleStopRev",
      "m 0 85 L 0 75 A 129.90375 129.90375 0 0 1 38.047927473438027 -16.855822526561973",
      '{"type": "gentle", "start": 0.25, "end": 1}',
    ],
    [
      "sharpStop",
      "m 0 85 L 0 75 A 43.30125 43.30125 0 0 0 -21.650625 37.5",
      '{"type": "sharp", "end": 0.5}',
    ],
    [
      "sharpStopRev",
      "m 0 85 L 0 75 A 43.30125 43.30125 0 0 1 21.650625 37.5",
      '{"type": "sharp", "start": 0.5, "end": 1}',
    ],
  ])(
    "draws deprecated %s and logs its replacement",
    async ([type, path, replacement]) => {
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      const [d] = await trackPath({ type });
      expect(d).toBe(path);
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining(`Track type "${type}" is currently deprecated`),
      );
      expect(log).toHaveBeenCalledWith(expect.stringContaining(replacement));
    },
  );

  it("draws a bent track as a curve", async () => {
    const [d] = await trackPath({ type: "bent" });
    expect(d).toBe(
      "m 0 85 L 0 75 C 0 30, 40 40, 40 0 C 40 -40, 0 -30, 0 -75 L 0 -85",
    );
  });

  it("draws a custom path as given", async () => {
    const [d] = await trackPath({ type: "custom", path: "m 1 2 L 3 4" });
    expect(d).toBe("m 1 2 L 3 4");
  });

  it("falls back to a short stub sized by the track width", async () => {
    const [d] = await trackPath({ type: "unknown", width: 20 });
    expect(d).toBe("m 0 85 L 0 -5.5");
  });

  it("uses the hex color for match colors", async () => {
    const svg = await drawSvg(
      <Track
        type="straight"
        gauge="narrow"
        color="match"
        gaugeColor="match"
        bgColor="green"
      />,
    );
    const [track, gauge] = all(svg, "path");
    expect(track).toHaveAttribute("stroke", gmt.green);
    expect(gauge).toHaveAttribute("stroke", gmt.green);
  });

  it("uses the hex color for a matching border", async () => {
    const svg = await drawSvg(
      <Track type="straight" border borderColor="match" bgColor="yellow" />,
    );
    expect(one(svg, "path")).toHaveAttribute("stroke", gmt.yellow);
    // Border width is added to the 12 default track width
    expect(one(svg, "path")).toHaveAttribute("stroke-width", "16");
  });

  it("takes widths, colors and gauge from the game info", async () => {
    const game = withInfo({
      trackWidth: 20,
      borderWidth: 6,
      trackGauge: "narrow",
      trackColor: "match",
      trackBorderColor: "match",
      trackGaugeColor: "match",
    });
    let svg = await drawSvg(
      <Track type="straight" gauge="dual" bgColor="brown" />,
      { game },
    );
    const [track, gauge] = all(svg, "path");
    expect(track).toHaveAttribute("stroke", gmt.brown);
    expect(track).toHaveAttribute("stroke-width", "20");
    // The game gauge wins over the dual gauge from the hex
    expect(gauge).toHaveAttribute("stroke-dasharray", "15");
    expect(gauge).toHaveAttribute("stroke", gmt.brown);

    svg = await drawSvg(<Track type="straight" border bgColor="brown" />, {
      game,
    });
    expect(one(svg, "path")).toHaveAttribute("stroke", gmt.brown);
    expect(one(svg, "path")).toHaveAttribute("stroke-width", "26");
  });

  it("offsets narrow gauge dashes", async () => {
    const svg = await drawSvg(
      <Track type="straight" gauge="narrow" offset={5} />,
    );
    const gauge = all(svg, "path")[1];
    expect(gauge).toHaveAttribute("stroke-dasharray", "9");
    expect(gauge).toHaveAttribute("stroke-dashoffset", "5");
    expect(gauge).toHaveAttribute("stroke", gmt.white);
  });

  it("draws dashed gauge as a thin dashed line", async () => {
    const svg = await drawSvg(<Track type="straight" gauge="dashed" />);
    const [track, gauge] = all(svg, "path");
    expect(track).toHaveAttribute("stroke-width", "2");
    expect(gauge).toHaveAttribute("stroke-dasharray", "9");
  });

  it("widens line gauge borders", async () => {
    const svg = await drawSvg(<Track type="straight" gauge="line" border />);
    expect(all(svg, "path")).toHaveLength(1);
    expect(one(svg, "path")).toHaveAttribute("stroke-width", "6");
  });

  it("fills dual gauge offboard track", async () => {
    const svg = await drawSvg(<Track type="offboard" gauge="dual" />);
    const [track, gauge] = all(svg, "path");
    expect(track).toHaveAttribute("fill", gmt.track);
    expect(track).toHaveAttribute("stroke", "none");
    expect(gauge).toHaveAttribute("fill", gmt.white);
    expect(gauge).toHaveAttribute("stroke", "none");
  });
});

describe("Border", () => {
  const borderPath = async (props) => {
    const svg = await drawSvg(<Border color="blue" {...props} />);
    return one(svg, "path");
  };

  it("draws a stroke of 10 by default", async () => {
    const path = await borderPath({});
    expect(path).toHaveAttribute("stroke-width", "10");
    expect(path).toHaveAttribute("stroke-dasharray", "none");
  });

  it("takes the thickness from strokeWidth", async () => {
    const path = await borderPath({ strokeWidth: 4 });
    expect(path).toHaveAttribute("stroke-width", "4");
  });

  it("honors a strokeWidth of 0", async () => {
    const path = await borderPath({ strokeWidth: 0 });
    expect(path).toHaveAttribute("stroke-width", "0");
  });

  it("keeps width as the dash length of a dashed border", async () => {
    const path = await borderPath({ dashed: true, strokeWidth: 4, width: 24 });
    expect(path).toHaveAttribute("stroke-width", "4");
    expect(path).toHaveAttribute("stroke-dasharray", "24");
  });
});

describe("City", () => {
  const circles = (svg) => all(svg, "circle");
  // Slot outlines, company tokens are outlined in black instead
  const outlines = (svg) =>
    circles(svg).filter(
      (c) =>
        c.getAttribute("r") === "25" &&
        c.getAttribute("fill") === "none" &&
        c.getAttribute("stroke") === gmt.track,
    );

  it("renders nothing for an unknown size", async () => {
    const svg = await drawSvg(<City size={7} />);
    expect(svg.children).toHaveLength(1); // only <defs>
  });

  it("draws a pass triangle behind single city borders", async () => {
    const svg = await drawSvg(<City border pass />);
    expect(one(svg, "polygon")).toHaveAttribute(
      "points",
      "0,-46 -39.83716857,23 39.83716857,23",
    );
    expect(one(svg, "circle")).toHaveAttribute("r", "28");
  });

  it("draws icons in city slots", async () => {
    const svg = await drawSvg(<City icons={["meat"]} rotation={30} />);
    // The icon is an inner svg sized to the city width
    const icon = one(svg, "g[transform='scale(1.4)'] svg");
    expect(icon).toHaveAttribute("width", "25");
    expect(icon).toHaveAttribute("x", "-12.5");
  });

  it("extends double cities left or right", async () => {
    let svg = await drawSvg(<City size={2} extend="left" />);
    expect(one(svg, "polygon")).toHaveAttribute(
      "points",
      "-55,-25, 25,-25 25,25 -55,25",
    );
    svg = await drawSvg(<City size={2} extend="right" border pass />);
    const [pass, border] = all(svg, "polygon");
    expect(pass).toHaveAttribute(
      "points",
      "0,-48 -48.49742261,35 48.49742261,35",
    );
    expect(border).toHaveAttribute("points", "-25,0 55,0");
  });

  it("draws a pass triangle in double cities", async () => {
    const svg = await drawSvg(<City size={2} pass />);
    expect(one(svg, "polygon")).toHaveAttribute(
      "points",
      "0,-42 -43.30127019,32 43.30127019,32",
    );
  });

  it("fills city slots with company tokens by abbrev or object", async () => {
    const svg = await drawSvg(
      <City
        size={2}
        companies={["BLRR", { abbrev: "BRR", reserved: true }]}
        name={{ name: "Testville", reverse: true }}
      />,
    );
    expect(svg).toHaveTextContent("BLRR");
    expect(svg).toHaveTextContent("BRR");
    expect(svg).toHaveTextContent("Testville");
    // Slot fills use the company colors
    expect(attr(svg, "circle", "fill")).toContain(rob.black);
  });

  it("writes city names straight when configured", async () => {
    const svg = await drawSvg(<City name={{ name: "Straight" }} />, {
      search: "?config.straightCityNames=true",
    });
    expect(one(svg, "textPath")).toBeNull();
    expect(svg).toHaveTextContent("Straight");
  });

  it.for([
    ["2Y", 3, 0],
    ["1S1Y", 3, 1],
    ["2S1Y", 4, 2],
  ])(
    "draws %s yellow cities with square slots",
    async ([size, polygons, slotCircles]) => {
      const svg = await drawSvg(
        <City size={size} companies={["BLRR"]} name={{ name: "Mixed" }} />,
      );
      // Background plus a fill and outline per square slot
      expect(all(svg, "svg > g polygon").length).toBeGreaterThanOrEqual(
        polygons,
      );
      expect(outlines(svg)).toHaveLength(slotCircles);
      expect(svg).toHaveTextContent("BLRR");
      expect(svg).toHaveTextContent("Mixed");
    },
  );

  it.for([
    ["2Y", ["50,25 -50,25 -50,-25 50,-25"]],
    ["1S1Y", ["-25,0 0,0", "50,25 0,25 0,-25 50,-25"]],
    ["2S1Y", ["-25,-25 -25,25"]],
    [
      "3Ferry",
      ["-25,-35.35533905932738 25,-35.35533905932738 0,35.35533905932738"],
    ],
  ])("draws %s city borders", async ([size, points]) => {
    const svg = await drawSvg(<City size={size} border borderColor="red" />);
    const polygons = all(svg, "polygon");
    points.forEach((p, i) => expect(polygons[i]).toHaveAttribute("points", p));
    polygons.forEach((p) => expect(p).toHaveAttribute("fill", gmt.red));
  });

  it.for([
    [5, "61.5"],
    [6, "67"],
  ])("draws a round border around %i cities", async ([size, r]) => {
    const svg = await drawSvg(<City size={size} border />);
    expect(circles(svg)).toHaveLength(1);
    expect(one(svg, "circle")).toHaveAttribute("r", r);
  });

  it.for([
    [5, 42.5],
    [6, 50],
  ])("places %i city slots in a ring", async ([size, radius]) => {
    const svg = await drawSvg(
      <City size={size} companies={["BLRR"]} name={{ name: "Ring" }} />,
    );
    const slots = all(svg, "g[transform^='translate']").filter(
      (g) => g.parentElement.tagName === "g",
    );
    const offsets = slots
      .map((g) =>
        /translate\(([^ ]+) ([^)]+)\)/.exec(g.getAttribute("transform")),
      )
      .filter(Boolean)
      .map(([, x, y]) => Math.hypot(Number(x), Number(y)));
    expect(offsets.filter((o) => Math.abs(o - radius) < 1e-6)).toHaveLength(
      size,
    );
    expect(outlines(svg)).toHaveLength(size);
    expect(svg).toHaveTextContent("Ring");
  });

  it("draws a ferry city with three slots and ferry lines", async () => {
    const svg = await drawSvg(
      <City size="3Ferry" companies={["BLRR"]} name={{ name: "Ferry" }} />,
    );
    expect(outlines(svg)).toHaveLength(3);
    // Two backgrounds and four ferry lines
    expect(all(svg, "polygon")).toHaveLength(6);
    expect(svg).toHaveTextContent("BLRR");
  });

  it("rotates size 3 borders", async () => {
    const svg = await drawSvg(<City size={3} border />);
    const polygon = one(svg, "polygon");
    expect(polygon).toHaveAttribute("fill", gmt.border);
    expect(polygon).toHaveAttribute("transform", "rotate(-30)");
  });

  it("draws size 4 borders as a rounded square", async () => {
    const svg = await drawSvg(<City size={4} border />);
    const polygon = one(svg, "polygon");
    expect(polygon).toHaveAttribute("fill", gmt.border);
    expect(polygon).toHaveAttribute("stroke-width", "56");
    expect(polygon).not.toHaveAttribute("transform");
  });

  it("scales the city by the game city width", async () => {
    const svg = await drawSvg(<City border />, {
      game: withInfo({ cityWidth: 50, borderWidth: 2 }),
    });
    // 50 width plus a 2 border scaled by 2
    expect(one(svg, "circle")).toHaveAttribute("r", "54");
  });
});

describe("Boomtown", () => {
  it.for([
    [true, "29"],
    [false, "14"],
  ])("sizes a single border for city %s", async ([city, r]) => {
    const svg = await drawSvg(<Boomtown border city={city} />);
    expect(one(svg, "circle")).toHaveAttribute("r", r);
    expect(one(svg, "circle")).toHaveAttribute("fill", gmt.border);
  });

  it("draws a dashed town outline around a boom city", async () => {
    const svg = await drawSvg(
      <Boomtown city name={{ name: "Boom", reverse: true }} />,
    );
    const [fill, outline, boom] = all(svg, "circle");
    expect(fill).toHaveAttribute("r", "25");
    expect(outline).toHaveAttribute("stroke", gmt.track);
    expect(boom).toHaveAttribute("r", "10");
    expect(boom).toHaveAttribute("stroke-dasharray", "4");
    // Reversed names run backwards around the city
    expect(one(svg, "path")).toHaveAttribute(
      "d",
      "M 0 -30 A 30 30 0 0 0 0 30 A 30 30 0 0 0 0 -30",
    );
  });

  it("draws a solid outline when not dashed", async () => {
    const svg = await drawSvg(<Boomtown city dashed={false} />);
    expect(all(svg, "circle")[2]).toHaveAttribute("stroke-dasharray", "1 0");
  });

  it("draws a boom town with a dashed city outline", async () => {
    const svg = await drawSvg(
      <Boomtown color="red" name={{ name: "Small" }} />,
    );
    const [outline, fill, boom] = all(svg, "circle");
    expect(outline).toHaveAttribute("r", "12");
    expect(fill).toHaveAttribute("fill", rob.red);
    expect(boom).toHaveAttribute("r", "25");
    expect(boom).toHaveAttribute("stroke-dasharray", "6");
    expect(one(svg, "path")).toHaveAttribute(
      "d",
      "M 0 30 A 30 30 0 0 1 0 -30 A 30 30 0 0 1 0 30",
    );
  });

  it("writes straight boomtown names above the city", async () => {
    const svg = await drawSvg(
      <Boomtown city name={{ name: "Flat", straight: true }} />,
    );
    expect(one(svg, "textPath")).toBeNull();
    expect(svg).toHaveTextContent("Flat");
  });

  it.for([
    [true, "M26,28 A27,28 0 1,0 26,-28 L-26,-28 A27,28 0 1,0 -26,28 L26,28"],
    [false, "M15,17 A16,17 0 1,0 15,-17 L-15,-17 A16,17 0 1,0 -15,17 L15,17"],
  ])("draws a double border for city %s", async ([city, d]) => {
    const svg = await drawSvg(<Boomtown size={2} border city={city} />);
    expect(one(svg, "path")).toHaveAttribute("d", d);
  });

  it("draws a double boom city", async () => {
    const svg = await drawSvg(
      <Boomtown size={2} city name={{ name: "Twin" }} dashed={false} />,
    );
    const circles = all(svg, "circle");
    expect(circles).toHaveLength(6);
    expect(attr(svg, "circle", "cx")).toEqual([
      "25",
      "25",
      "25",
      "-25",
      "-25",
      "-25",
    ]);
    expect(circles[2]).toHaveAttribute("stroke-dasharray", "1 0");
    expect(svg).toHaveTextContent("Twin");
  });

  it("draws a double boom town", async () => {
    const svg = await drawSvg(
      <Boomtown
        size={2}
        name={{ name: "Twins", reverse: true, straight: true }}
      />,
    );
    const circles = all(svg, "circle");
    expect(circles).toHaveLength(6);
    expect(circles[0]).toHaveAttribute("cx", "-13");
    expect(circles[0]).toHaveAttribute("stroke-dasharray", "6");
    expect(circles[1]).toHaveAttribute("cx", "13");
    expect(svg).toHaveTextContent("Twins");
  });
});

describe("MediumCity", () => {
  it("draws a scaled border", async () => {
    const svg = await drawSvg(<MediumCity border width={44} />);
    expect(one(svg, "g")).toHaveAttribute("transform", "scale(2)");
    expect(one(svg, "circle")).toHaveAttribute("r", "21");
    expect(one(svg, "circle")).toHaveAttribute("fill", gmt.border);
  });

  it("draws an outline and fill with defaults", async () => {
    const svg = await drawSvg(<MediumCity name={{ name: "Mid" }} />);
    const [outline, fill] = all(svg, "circle");
    expect(outline).toHaveAttribute("r", "17");
    expect(outline).toHaveAttribute("stroke-width", "3");
    expect(fill).toHaveAttribute("r", "12");
    expect(fill).toHaveAttribute("fill", gmt.track);
    expect(fill).toHaveAttribute("stroke-width", "1");
    expect(svg).toHaveTextContent("Mid");
  });

  it("takes fill, stroke and outline options", async () => {
    const svg = await drawSvg(
      <MediumCity
        fillColor="red"
        fillOpacity="0.5"
        strokeColor="blue"
        strokeWidth={0}
        strokeDashArray="2 2"
        outlineColor="white"
        outlineStroke="black"
        outlineStrokeWidth="5"
      />,
    );
    const [outline, fill] = all(svg, "circle");
    expect(outline).toHaveAttribute("fill", rob.white);
    expect(outline).toHaveAttribute("stroke", rob.black);
    expect(outline).toHaveAttribute("stroke-width", "5");
    expect(fill).toHaveAttribute("fill", rob.red);
    expect(fill).toHaveAttribute("fill-opacity", "0.5");
    expect(fill).toHaveAttribute("stroke", rob.blue);
    expect(fill).toHaveAttribute("stroke-width", "0");
    expect(fill).toHaveAttribute("stroke-dasharray", "2 2");
  });
});

describe("TunnelEntrance", () => {
  it("draws a border sized to the entrance", async () => {
    const svg = await drawSvg(<TunnelEntrance border size={10} />);
    expect(one(svg, "circle")).toHaveAttribute("r", "13");
    expect(one(svg, "rect")).toHaveAttribute("width", "36");
    expect(one(svg, "rect")).toHaveAttribute("x", "-18");
  });

  it("draws the entrance with its portals", async () => {
    const svg = await drawSvg(<TunnelEntrance color="red" trackColor="blue" />);
    const [fill, outline] = all(svg, "circle");
    expect(fill).toHaveAttribute("r", "15");
    expect(fill).toHaveAttribute("fill", rob.red);
    expect(outline).toHaveAttribute("stroke", rob.blue);
    expect(attr(svg, "path", "d")).toEqual([
      "M -14.5 -5 l -8 0 0 10 8 0",
      "M 14.5 -5 l 8 0 0 10 -8 0",
    ]);
  });
});

describe("Terrain", () => {
  it.for([
    ["swamp", "large", "translate(0 -10) scale(2)"],
    ["mountain", "medium", "translate(0 -8) scale(1.5)"],
    ["cow-skull", "tiny", "translate(0 -18) scale(0.75)"],
    ["wheat", undefined, "translate(0 -18) scale(1)"],
    ["noenter", undefined, "translate(0 -18) scale(1)"],
    ["flag", undefined, "translate(0 -18) scale(1)"],
    ["water", undefined, "translate(0 -12) scale(1)"],
  ])("positions the %s icon", async ([type, size, transform]) => {
    const svg = await drawSvg(<Terrain type={type} size={size} cost={40} />);
    expect(one(svg, "svg g g")).toHaveAttribute("transform", transform);
    expect(svg).toHaveTextContent("$40");
  });

  it("does not counter rotate fixed or rotation-fixed terrain", async () => {
    let svg = await drawSvg(<Terrain type="mountain" cost={10} fixed />);
    expect(one(svg, "svg > g")).not.toHaveAttribute("transform");

    svg = await drawSvg(
      <RotateContext.Provider value={{ fixed: true, angle: 60 }}>
        <Terrain cost={10} />
      </RotateContext.Provider>,
    );
    expect(one(svg, "svg > g")).not.toHaveAttribute("transform");
  });

  it("counter rotates terrain and outlines colored costs", async () => {
    const svg = await drawSvg(
      <RotateContext.Provider value={{ fixed: false, angle: 60 }}>
        <Terrain cost={10} color="red" rotation={30} />
      </RotateContext.Provider>,
    );
    expect(one(svg, "svg > g")).toHaveAttribute("transform", "rotate(-90)");
    expect(one(svg, "text")).toHaveAttribute("stroke-width", "1");
    expect(one(svg, "text")).toHaveAttribute("fill", gmt.red);
  });
});

describe("Value", () => {
  it("sizes the ellipse to the text", async () => {
    const svg = await drawSvg(<Value value={1000} fontSize={20} />);
    const ellipse = one(svg, "ellipse");
    // fontSize 20 gives ry 15, "1000" is 4 long so rx is 4 * 15 * 3/5
    expect(ellipse).toHaveAttribute("ry", "15");
    expect(ellipse).toHaveAttribute("rx", "36");
  });

  it("draws square values with an outer border", async () => {
    const svg = await drawSvg(
      <Value
        value={20}
        shape="square"
        outerBorderColor="red"
        width={40}
        height={30}
        rotation={30}
      />,
    );
    const [outline, bg] = all(svg, "rect");
    expect(outline).toHaveAttribute("stroke", gmt.red);
    expect(outline).toHaveAttribute("stroke-width", "7");
    expect(bg).toHaveAttribute("width", "40");
    expect(bg).toHaveAttribute("height", "30");
    expect(bg).toHaveAttribute("x", "-20");
    expect(bg).toHaveAttribute("transform", "rotate(-30)");
  });

  it("draws an outer border around round values", async () => {
    const svg = await drawSvg(
      <Value value={20} outerBorderColor="green" fixed />,
    );
    const [outline, bg] = all(svg, "ellipse");
    expect(outline).toHaveAttribute("stroke", gmt.green);
    expect(outline).not.toHaveAttribute("transform");
    expect(bg).toHaveAttribute("rx", "14");
  });

  it("draws only text without a shape", async () => {
    const svg = await drawSvg(<Value value={20} shape="none" />);
    expect(one(svg, "ellipse")).toBeNull();
    expect(one(svg, "rect")).toBeNull();
    expect(one(svg, "text")).toHaveTextContent("20");
  });

  it("does not rotate square values in fixed contexts", async () => {
    const svg = await drawSvg(
      <RotateContext.Provider value={{ fixed: true, angle: 60 }}>
        <Value value={20} shape="square" outerBorderColor="red" />
      </RotateContext.Provider>,
    );
    all(svg, "rect").forEach((r) => expect(r).not.toHaveAttribute("transform"));
  });
});

describe("Id", () => {
  it("hides ids when configured or asked", async () => {
    let svg = await drawSvg(<Id id="57" bgColor="yellow" />, {
      search: "?config.tiles.id=none",
    });
    expect(one(svg, "text")).toBeNull();
    svg = await drawSvg(<Id id="57" bgColor="yellow" noID />);
    expect(one(svg, "text")).toBeNull();
  });

  it("prefixes colorblind symbols for plain and striped tiles", async () => {
    let svg = await drawSvg(<Id id="57" bgColor="yellow" />, {
      search: "?config.tiles.colorblind=true",
    });
    expect(one(svg, "text")).toHaveTextContent("⏷57");
    svg = await drawSvg(<Id id="57" bgColor="green/brown" />, {
      search: "?config.tiles.colorblind=true",
    });
    expect(one(svg, "text")).toHaveTextContent("⏹⏺57");
    svg = await drawSvg(<Id id="57" bgColor="pink" />, {
      search: "?config.tiles.colorblind=true",
    });
    expect(one(svg, "text")).toHaveTextContent(/^57$/);
  });

  it("puts the id on the left and the extra on the right", async () => {
    const svg = await drawSvg(<Id id="12345" extra="abcd" bgColor="yellow" />, {
      search: "?config.tiles.id=left",
    });
    const [id, extra] = all(svg, "text");
    expect(id).toHaveAttribute("text-anchor", "start");
    expect(id).toHaveAttribute("font-size", "9");
    expect(id.parentElement).toHaveAttribute(
      "transform",
      "rotate(0) translate(-40 70)",
    );
    expect(extra).toHaveTextContent("abcd");
    expect(extra).toHaveAttribute("text-anchor", "end");
    expect(extra).toHaveAttribute("font-size", "10");
  });

  it("shrinks long extras", async () => {
    const svg = await drawSvg(<Id id="1" extra="abcde" bgColor="yellow" />);
    const [id, extra] = all(svg, "text");
    expect(id).toHaveAttribute("font-size", "12");
    expect(extra).toHaveAttribute("font-size", "9");
    expect(extra).toHaveAttribute("text-anchor", "start");
  });
});

describe("CenterTown", () => {
  it("draws a double town border", async () => {
    const svg = await drawSvg(<CenterTown size={2} border />);
    expect(one(svg, "path")).toHaveAttribute(
      "d",
      "M15,16 A16,16 0 1,0 15,-16 L-15,-16 A16,16 0 1,0 -15,16 L15,16",
    );
  });

  it("draws a double town with a name", async () => {
    const svg = await drawSvg(
      <CenterTown size={2} color="red" name={{ name: "Pair" }} />,
    );
    const [left, right] = all(svg, "circle");
    expect(left).toHaveAttribute("cx", "-13");
    expect(right).toHaveAttribute("cx", "13");
    expect(left).toHaveAttribute("fill", gmt.red);
    expect(svg).toHaveTextContent("Pair");
  });
});

describe("Shapes", () => {
  it("draws a dashed ellipse with text", async () => {
    const svg = await drawSvg(
      <Shape
        type="ellipse"
        width={100}
        height={25}
        dashed
        color="red"
        text="E"
      />,
    );
    const ellipse = one(svg, "ellipse");
    expect(ellipse).toHaveAttribute("rx", "50");
    expect(ellipse).toHaveAttribute("ry", "12.5");
    expect(ellipse).toHaveAttribute("fill", gmt.red);
    expect(numbers(ellipse.getAttribute("stroke-dasharray"))).toEqual(
      [14, 14].map(close),
    );
    expect(one(svg, "text")).toHaveTextContent("E");
  });

  it("draws a scaled dashed star", async () => {
    const svg = await drawSvg(<Shape type="star" width={25} dashed text="S" />);
    expect(one(svg, "svg > g")).toHaveAttribute(
      "transform",
      "scale(1) translate(-25 -25)",
    );
    expect(numbers(one(svg, "path").getAttribute("stroke-dasharray"))).toEqual(
      [3.5, 3.5].map(close),
    );
    expect(one(svg, "text")).toHaveTextContent("S");
  });
});
