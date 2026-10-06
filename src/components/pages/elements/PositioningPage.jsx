import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { map } from "ramda";

import Hex from "@/components/Hex";
import Code from "@/components/docs/Code";
import Svg from "@/components/svg/Svg";

const city = { cities: [{}] };
const centerTown = { centerTowns: [{}] };
const icon = { icons: [{ type: "boat" }] };
const terrain = { terrain: [{ type: "mountain", cost: 60 }] };

const groups = [
  {
    id: "place",
    section: "basic",
    examples: [
      {
        id: "coordinates",
        hex: {
          labels: [
            { label: "0", angle: 0, percent: 0.5 },
            { label: "90", angle: 90, percent: 0.5 },
            { label: "180", angle: 180, percent: 0.5 },
            { label: "270", angle: 270, percent: 0.5 },
          ],
        },
      },
      {
        id: "basicAnglePercent",
        hex: { labels: [{ label: "B", angle: 90, percent: 0.6 }] },
      },
      {
        id: "basicXY",
        hex: { labels: [{ label: "B", x: 20, y: -15 }] },
      },
      {
        id: "placeAll",
        hex: {
          labels: [{ label: "B", angle: 90, percent: 0.6, x: 5, y: 10 }],
        },
      },
      {
        id: "placeOutside",
        wide: true,
        hex: {
          names: [{ name: "Name", angle: 0, percent: 1.2 }],
          labels: [{ label: "B", angle: 180, percent: 1.2 }],
        },
      },
    ],
  },
  {
    id: "turn",
    examples: [
      {
        id: "basicRotation",
        hex: { towns: [{ rotation: 45 }] },
      },
      {
        id: "basicRotate",
        hex: { towns: [{ rotate: 45 }] },
      },
      {
        id: "basicSide",
        hex: { towns: [{ side: 2 }] },
      },
      {
        id: "turnLabelRotation",
        hex: { labels: [{ label: "B", rotation: 45 }] },
      },
      {
        id: "turnLabelRotate",
        hex: { labels: [{ label: "B", rotate: 45 }] },
      },
      {
        id: "turnToken",
        hex: { tokens: [{ label: "AB", color: "white", rotate: 45 }] },
      },
    ],
  },
  {
    id: "named",
    examples: [
      {
        id: "namedSharp",
        hex: {
          track: [{ type: "sharp", side: 1 }],
          centerTowns: [{ mid: "sharp" }],
        },
      },
      {
        id: "namedGentle",
        hex: {
          track: [{ type: "gentle", side: 1 }],
          centerTowns: [{ mid: "gentle" }],
        },
      },
      {
        id: "namedBar",
        hex: {
          track: [{ type: "gentle", side: 1 }],
          towns: [{ mid: "gentle", align: "perpendicular" }],
        },
      },
      {
        id: "namedSide",
        hex: {
          track: [{ type: "gentle", side: 3 }],
          towns: [{ mid: "gentle", side: 3, align: "perpendicular" }],
        },
      },
      {
        id: "namedStraight",
        hex: {
          track: [{ type: "straight", side: 2 }],
          towns: [{ mid: "straight", side: 2, align: "perpendicular" }],
        },
      },
      {
        id: "namedParallel",
        hex: {
          track: [{ type: "gentle", side: 1 }],
          towns: [{ mid: "gentle", align: "parallel" }],
        },
      },
      {
        id: "namedOffset",
        hex: {
          track: [{ type: "gentle", side: 1 }],
          towns: [{ mid: "gentle", align: "perpendicular", rotate: 30 }],
        },
      },
      {
        id: "namedOverride",
        hex: {
          track: [{ type: "gentle", side: 1 }],
          labels: [{ label: "B", mid: "gentle", percent: 0.6 }],
        },
      },
      {
        id: "namedNudge",
        hex: {
          track: [{ type: "gentle", side: 1 }],
          labels: [{ label: "B", mid: "gentle", x: 15, y: 10 }],
        },
      },
    ],
  },
  {
    id: "hide",
    examples: [
      {
        id: "basicHidden",
        hex: { labels: [{ label: "B", hidden: true }, { label: "NY" }] },
      },
    ],
  },
  {
    id: "auto",
    examples: [
      { id: "valueOne", hex: { values: [{ value: 30 }] } },
      { id: "valueTwo", hex: { values: [{ value: 30 }, { value: 40 }] } },
      { id: "labelOne", hex: { labels: [{ label: "B" }] } },
      { id: "labelTwo", hex: { labels: [{ label: "B" }, { label: "NY" }] } },
      {
        id: "labelThree",
        hex: { labels: [{ label: "B" }, { label: "NY" }, { label: "OO" }] },
      },
      {
        id: "autoIndex",
        hex: {
          labels: [{ label: "B", angle: 90, percent: 0.6 }, { label: "NY" }],
        },
      },
      { id: "iconCity", hex: { ...city, ...icon } },
      { id: "iconCenterTown", hex: { ...centerTown, ...icon } },
      { id: "iconTerrain", hex: { ...city, ...icon, ...terrain } },
      { id: "iconAlone", hex: icon },
      { id: "terrainCity", hex: { ...city, ...terrain } },
      { id: "terrainCenterTown", hex: { ...centerTown, ...terrain } },
      { id: "terrainIcon", hex: { ...city, ...terrain, ...icon } },
      { id: "terrainAlone", hex: terrain },
    ],
  },
  {
    id: "off",
    examples: [
      {
        id: "offAngle",
        hex: { ...city, terrain: [{ type: "mountain", cost: 60, angle: 0 }] },
      },
      {
        id: "offOne",
        hex: {
          ...city,
          terrain: [
            { type: "mountain", cost: 60, x: 0 },
            { type: "mountain", cost: 120 },
          ],
        },
      },
    ],
  },
  {
    id: "all",
    examples: [
      {
        id: "everything",
        hex: {
          ...city,
          ...terrain,
          ...icon,
          values: [{ value: 30 }],
          labels: [{ label: "B" }, { label: "NY" }],
        },
      },
    ],
  },
  {
    id: "order",
    examples: [
      {
        id: "orderCity",
        hex: { cities: [{ order: 1 }], values: [{ value: 30, x: 0, y: 0 }] },
      },
      {
        id: "orderBehind",
        hex: { ...city, labels: [{ label: "B", x: 0, y: 0, order: -1 }] },
      },
    ],
  },
];

const Example = ({ id, hex, wide }) => {
  const { t } = useTranslation();

  return (
    <div
      className="checkered border border-solid flex flex-col rounded-xl overflow-hidden items-center font-display font-bold"
      data-testid={`positioning-${id}`}
    >
      <Svg
        width={wide ? 240 : 175.205}
        height={wide ? 200 : 152}
        viewBox={wide ? "-120 -100 240 200" : "-87.6025 -76 175.205 152"}
        className="m-4"
      >
        <Hex hex={hex} id={id} border={true} bleed={true} />
      </Svg>
      <div className="p-4 text-wrap border-t bg-background w-full font-sans font-normal">
        {t(`elements.positioning.examples.${id}`)}
      </div>
      <Code className="m-0 w-full grow border-t" language="json">
        {JSON.stringify(hex, null, 2)}
      </Code>
    </div>
  );
};

const PositioningPage = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // The router does not scroll to a #group, so a deep link or a click on the
  // jump list does it here (like the docs pages)
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) {
      document.getElementById(id)?.scrollIntoView();
    }
  }, [location.hash]);

  return (
    <div className="p-4" data-testid="positioning">
      <h1 className="text-4xl font-extrabold">
        {t("elements.positioning.title")}
      </h1>
      <p className="leading-7 mt-6 text-wrap">
        {t("elements.positioning.page.description")}
      </p>
      <p className="leading-7 mt-2">
        <Link className="underline" to="/docs/games/positioning">
          {t("elements.positioning.page.docs")}
        </Link>
      </p>
      <nav
        className="mt-6"
        aria-label={t("elements.positioning.page.jump")}
        data-testid="positioning-jump"
      >
        <ol className="list-decimal pl-6 leading-7 max-w-3xl">
          {map(
            (group) => (
              <li key={group.id}>
                <Link
                  className="underline font-semibold"
                  to={{ hash: `#${group.id}` }}
                >
                  {t(`elements.positioning.groups.${group.id}`)}
                </Link>
                {": "}
                {t(`elements.positioning.groupDescriptions.${group.id}`)}{" "}
                <Link
                  className="underline text-muted-foreground"
                  aria-label={t("elements.positioning.page.docLinkLabel", {
                    title: t(`elements.positioning.groups.${group.id}`),
                  })}
                  to={`/docs/games/positioning#${t(`elements.positioning.docAnchors.${group.id}`)}`}
                >
                  {t("elements.positioning.page.docLink")}
                </Link>
              </li>
            ),
            groups,
          )}
        </ol>
      </nav>
      {map(
        (group) => (
          <section key={group.id} id={group.section} className="mt-8">
            <h2 id={group.id} className="text-2xl font-bold my-4 scroll-mt-16">
              {t(`elements.positioning.groups.${group.id}`)}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 max-w-7xl">
              {map(
                (example) => (
                  <Example key={example.id} {...example} />
                ),
                group.examples,
              )}
            </div>
          </section>
        ),
        groups,
      )}
    </div>
  );
};

export default PositioningPage;
