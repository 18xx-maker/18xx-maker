/* eslint-disable testing-library/no-node-access */
import { screen } from "@testing-library/react";

import HexTile from "@/components/Hex";

import OrientationContext from "@/context/OrientationContext";
import { namedPosition } from "@/util/tiles/trackGeometry";

import { renderApp } from "@tests/support/helpers.jsx";
import { all, drawSvg } from "@tests/support/render.jsx";

const at = (angle, translate) =>
  `rotate(${angle} 0 0) translate(0 ${translate}) rotate(${-angle} 0 0) translate(0 0)`;

describe("auto positioning examples page", () => {
  it("links to the doc", async () => {
    renderApp("/elements/positioning");
    expect(
      await screen.findByRole("link", { name: /Auto Positioning doc/ }),
    ).toHaveAttribute("href", "/docs/games/positioning");
  });

  it("draws the transforms the rules promise", async () => {
    renderApp("/elements/positioning");
    await screen.findByTestId("positioning");

    const rotate = (id) =>
      [
        ...screen
          .getByTestId(`positioning-${id}`)
          .querySelectorAll("svg g[transform^='rotate']"),
      ].map((g) => g.getAttribute("transform"));
    const count = (id, prefix) =>
      rotate(id).filter((t) => t.startsWith(prefix)).length;

    // icons: only with a city or centerTown, 30 when there is terrain too
    expect(rotate("iconCity")).toContain(at(0, 45));
    expect(rotate("iconCenterTown")).toContain(at(0, 45));
    expect(rotate("iconTerrain")).toContain(at(30, 45));
    expect(rotate("iconAlone")).not.toContain(at(0, 45));

    // terrain: only with a city or centerTown, 330 when there is an icon too
    expect(rotate("terrainCity")).toContain(at(0, 52.5));
    expect(rotate("terrainCenterTown")).toContain(at(0, 52.5));
    expect(rotate("terrainIcon")).toContain(at(330, 52.5));
    expect(rotate("terrainAlone")).not.toContain(at(0, 52.5));

    // any positioning field turns it off for that element only
    expect(rotate("offAngle")).not.toContain(at(0, 52.5));
    expect(rotate("offOne")).toContain(at(0, 52.5));

    // values: the first only
    expect(count("valueOne", "rotate(210 ")).toBe(1);
    expect(count("valueTwo", "rotate(210 ")).toBe(1);

    // labels: the first two only
    expect(count("labelOne", "rotate(150 ")).toBe(1);
    expect(count("labelTwo", "rotate(150 ")).toBe(1);
    expect(count("labelTwo", "rotate(270 ")).toBe(1);
    expect(count("labelThree", "rotate(150 ")).toBe(1);
    expect(count("labelThree", "rotate(270 ")).toBe(1);
  });
});

describe("named positions", () => {
  const transforms = async (towns) => {
    const svg = await drawSvg(<HexTile hex={{ color: "yellow", towns }} />);
    return all(svg, "g[transform^='rotate']").map((g) =>
      g.getAttribute("transform"),
    );
  };
  const sharp = namedPosition("sharp");
  const gentle = namedPosition("gentle");

  it("puts a mid with align where the equivalent angle, percent and rotation do", async () => {
    expect(
      await transforms([{ mid: "sharp", align: "perpendicular" }]),
    ).toEqual(await transforms([{ ...sharp, rotation: 120 }]));
    expect(await transforms([{ mid: "gentle", align: "parallel" }])).toEqual(
      await transforms([{ ...gentle, rotation: 240 }]),
    );
  });

  it("does not turn the element without align", async () => {
    expect(await transforms([{ mid: "gentle" }])).toEqual(
      await transforms([{ ...gentle }]),
    );
  });

  it("moves a mid to a side and adds rotate as an offset", async () => {
    expect(
      await transforms([
        { mid: "gentle", side: 3, align: "perpendicular", rotate: 10 },
      ]),
    ).toEqual(
      await transforms([
        { angle: 180, percent: gentle.percent, rotation: 280 },
      ]),
    );
  });

  it("lets an explicit angle or percent override the mid", async () => {
    expect(await transforms([{ mid: "sharp", angle: 90 }])).toEqual(
      await transforms([{ angle: 90, percent: sharp.percent }]),
    );
    expect(await transforms([{ mid: "sharp", percent: 0.2 }])).toEqual(
      await transforms([{ angle: 30, percent: 0.2 }]),
    );
  });

  it("nudges with x and y", async () => {
    expect(await transforms([{ mid: "sharp", x: 5, y: -3 }])).toEqual(
      await transforms([{ ...sharp, x: 5, y: -3 }]),
    );
    expect(
      (await transforms([{ mid: "sharp", x: 5, y: -3 }])).some((t) =>
        t.endsWith("translate(5 -3)"),
      ),
    ).toBe(true);
  });

  it("keeps side as a rotation without a mid", async () => {
    expect(await transforms([{ side: 3 }])).toEqual(
      await transforms([{ rotation: 120 }]),
    );
  });
});

describe("named positions and children", () => {
  const html = async (hex, orientation = 0) => {
    const svg = await drawSvg(
      <OrientationContext.Provider value={orientation}>
        <HexTile hex={{ color: "yellow", ...hex }} />
      </OrientationContext.Provider>,
    );
    return svg.innerHTML;
  };
  const gentle = namedPosition("gentle");

  it("hands the aligned rotation to a value", async () => {
    expect(
      await html({
        values: [{ value: 30, mid: "gentle", align: "perpendicular" }],
      }),
    ).toEqual(
      await html({ values: [{ value: 30, ...gentle, rotation: 150 }] }),
    );
  });

  it("hands the aligned rotation to a city", async () => {
    expect(
      await html({
        cities: [{ mid: "gentle", align: "perpendicular", size: 2 }],
      }),
    ).toEqual(
      await html({
        cities: [{ ...gentle, rotation: 150, size: 2 }],
      }),
    );
  });

  it("follows the track on a vertical map", async () => {
    // gentle on side 1 is at angle 60, and the track is turned by 90 more
    expect(
      await html({ towns: [{ mid: "gentle", align: "parallel" }] }, 90),
    ).toEqual(
      await html(
        { towns: [{ angle: 150, percent: gentle.percent, rotation: 330 }] },
        90,
      ),
    );
    expect(await html({ values: [{ value: 3, mid: "gentle" }] }, 90)).toEqual(
      await html(
        { values: [{ value: 3, angle: 150, percent: gentle.percent }] },
        90,
      ),
    );
  });
});
