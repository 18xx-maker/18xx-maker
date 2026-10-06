/* eslint-disable testing-library/no-node-access */
import { act, screen, within } from "@testing-library/react";

import HexTile from "@/components/Hex";

import OrientationContext from "@/context/OrientationContext";
import i18n from "@/locales/i18n";
import { namedPosition } from "@/util/tiles/trackGeometry";

import { renderApp } from "@tests/support/helpers.jsx";
import { all, drawSvg } from "@tests/support/render.jsx";

const at = (angle, translate) =>
  `rotate(${angle} 0 0) translate(0 ${translate}) rotate(${-angle} 0 0) translate(0 0)`;

describe("auto positioning examples page", () => {
  it("links to the doc", async () => {
    renderApp("/elements/positioning");
    expect(
      await screen.findByRole("link", { name: /Positioning doc/ }),
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

    // generic options: each example is drawn with its own transform
    const svg = (id) =>
      screen.getByTestId(`positioning-${id}`).querySelector("svg").innerHTML;
    const has = (id, s) => svg(id).includes(s);
    expect(rotate("basicAnglePercent")).toContain(at(90, 45));
    expect(has("basicXY", "translate(20 -15)")).toBe(true);
    expect(has("basicRotation", "rotate(45 ")).toBe(true);
    expect(has("basicRotate", "rotate(45 ")).toBe(true);
    // the svg holds the example id as text, so compare without it
    const drawn = (id) => svg(id).replace(/<text.*<\/text>/, "");
    expect(drawn("basicRotation")).toEqual(drawn("basicRotate"));
    expect(has("basicSide", "rotate(60 0 0)")).toBe(true);
    expect(has("basicSide", "rotate(45 ")).toBe(false);
    // the hidden first label keeps its index, so NY is drawn at the second
    expect(has("basicHidden", "NY")).toBe(true);
    expect(has("basicHidden", ">B<")).toBe(false);
    expect(has("basicHidden", "rotate(270 ")).toBe(true);

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
    // a rotation of 0 (straight, perpendicular) is turned by the map too
    expect(
      await html({ towns: [{ mid: "straight", align: "perpendicular" }] }, 90),
    ).toEqual(
      await html({ towns: [{ angle: 90, percent: 0, rotation: 90 }] }, 90),
    );
    expect(await html({ values: [{ value: 3, mid: "gentle" }] }, 90)).toEqual(
      await html(
        { values: [{ value: 3, angle: 150, percent: gentle.percent }] },
        90,
      ),
    );
  });
});

describe("positioning examples page groups", () => {
  const groups = [
    "place",
    "turn",
    "named",
    "hide",
    "auto",
    "off",
    "all",
    "order",
  ];
  afterEach(() => act(() => i18n.changeLanguage("en")));

  it("lists the groups in the order of the doc and links the doc", async () => {
    renderApp("/elements/positioning");
    const nav = within(await screen.findByTestId("positioning-jump"));

    expect(nav.getAllByRole("listitem")).toHaveLength(groups.length);
    expect(
      nav
        .getAllByRole("link", { name: /^[^:]+$/ })
        .filter((a) => a.getAttribute("href").includes("/elements/"))
        .map((a) => a.getAttribute("href")),
    ).toEqual(groups.map((id) => `/elements/positioning#${id}`));
    expect(
      nav
        .getAllByRole("link", { name: /doc section/ })
        .map((a) => a.getAttribute("href")),
    ).toEqual(
      [
        "placing",
        "turning",
        "named-positions",
        "hiding",
        "auto-positioning",
        "turning-it-off",
        "auto-positioning",
        "draw-order",
      ].map((a) => `/docs/games/positioning#${a}`),
    );
  });

  it("takes the doc anchors from the language", async () => {
    renderApp("/elements/positioning", { settings: { language: "de" } });
    const nav = within(await screen.findByTestId("positioning-jump"));

    expect(
      nav
        .getAllByRole("link", { name: /Abschnitt der Doku/ })
        .map((a) => a.getAttribute("href")),
    ).toContain("/docs/games/positioning#benannte-positionen");
  });

  it("has a section for every group and keeps #basic", async () => {
    renderApp("/elements/positioning");
    await screen.findByTestId("positioning");

    groups.forEach((id) => expect(document.getElementById(id)).not.toBeNull());
    expect(document.getElementById("basic")).toContainElement(
      document.getElementById("place"),
    );
    [
      "coordinates",
      "placeAll",
      "placeOutside",
      "autoIndex",
      "orderCity",
    ].forEach((id) =>
      expect(screen.getByTestId(`positioning-${id}`)).toBeVisible(),
    );
  });

  it("draws the coordinates example at the promised angles", async () => {
    renderApp("/elements/positioning");
    await screen.findByTestId("positioning");
    const rotate = [
      ...screen
        .getByTestId("positioning-coordinates")
        .querySelectorAll("svg g[transform^='rotate']"),
    ].map((g) => g.getAttribute("transform"));

    [0, 90, 180, 270].forEach((angle) =>
      expect(rotate).toContain(at(angle, 37.5)),
    );
  });

  it("draws a percent above 1 only for an element drawn outside the hex", async () => {
    renderApp("/elements/positioning");
    const example = await screen.findByTestId("positioning-placeOutside");
    const text = (s) =>
      [...example.querySelectorAll("text")].find((t) => t.textContent === s);

    expect(text("Name").closest("[clip-path]")).toBeNull();
    expect(text("B").closest("[clip-path]")).not.toBeNull();
  });

  it("goes by the place in the array for auto positioning", async () => {
    renderApp("/elements/positioning");
    const example = await screen.findByTestId("positioning-autoIndex");
    const rotate = [
      ...example.querySelectorAll("svg g[transform^='rotate']"),
    ].map((g) => g.getAttribute("transform"));

    expect(rotate).toContain(at(90, 45));
    expect(rotate.filter((t) => t.startsWith("rotate(270 "))).toHaveLength(1);
    expect(rotate.some((t) => t.startsWith("rotate(150 "))).toBe(false);
  });
});

describe("placing and turning", () => {
  const draw = async (hex, orientation = 0) =>
    drawSvg(
      <OrientationContext.Provider value={orientation}>
        <HexTile hex={{ color: "yellow", ...hex }} />
      </OrientationContext.Provider>,
    );
  const transforms = async (hex) =>
    all(await draw(hex), "g[transform^='rotate']").map((g) =>
      g.getAttribute("transform"),
    );
  // The angle of an element on the screen, in degrees
  const turned = (el) => {
    const m = el.getCTM();
    return Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI);
  };
  const label = async (extra) =>
    turned(all(await draw({ labels: [{ label: "B", ...extra }] }), "text")[0]);
  const token = async (extra) =>
    turned(
      all(
        await draw({ tokens: [{ type: "blank", label: "AB", ...extra }] }),
        "text",
      )[0],
    );
  const town = async (extra) =>
    turned(all(await draw({ towns: [{ ...extra }] }), "rect")[0]);

  it("keeps x and y in screen units whatever the angle and rotation", async () => {
    const plain = await transforms({
      labels: [{ label: "B", angle: 90, percent: 0.6, x: 10, y: 5 }],
    });
    const turnedBy = await transforms({
      labels: [
        { label: "B", angle: 90, percent: 0.6, x: 10, y: 5, rotation: 45 },
      ],
    });

    [plain, turnedBy].forEach((list) =>
      expect(list.some((t) => t.endsWith("translate(10 5)"))).toBe(true),
    );
    // only the turn in the last rotate changes
    expect(plain[0].split(" translate")[0]).toEqual(
      turnedBy[0].split(" translate")[0],
    );
  });

  it("does not move an element with side and no mid", async () => {
    expect(await transforms({ towns: [{ side: 2 }] })).toContain(
      "rotate(0 0 0) translate(0 0) rotate(60 0 0) translate(0 0)",
    );
  });

  it("adds side to rotation", async () => {
    expect(await town({ side: 2, rotation: 30 })).toBe(90);
    expect(await town({ side: 2, rotate: 30 })).toBe(90);
  });

  it("uses a rotate that is not 0 over rotation, and never adds them", async () => {
    expect(await town({ rotate: 30, rotation: 45 })).toBe(30);
    expect(await town({ rotate: 0, rotation: 45 })).toBe(45);
  });

  it("keeps the text of a label upright with rotation, but not with rotate", async () => {
    expect(await label({ rotation: 45 })).toBe(0);
    expect(await label({ rotate: 45 })).toBe(45);
    expect(await label({ side: 2 })).toBe(60);
  });

  it("turns a town the same with rotation, rotate and side", async () => {
    expect(await town({ rotation: 45 })).toBe(45);
    expect(await town({ rotate: 45 })).toBe(45);
    expect(await town({ side: 2 })).toBe(60);
  });

  it("turns a token twice as far with rotation, and exactly with rotate or fixed", async () => {
    expect(await token({ rotation: 45 })).toBe(90);
    expect(await token({ rotate: 45 })).toBe(45);
    expect(await token({ rotation: 45, fixed: true })).toBe(45);
  });
});
