import { useTranslation } from "react-i18next";
import { Link } from "react-router";

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
    id: "basic",
    examples: [
      {
        id: "basicAnglePercent",
        hex: { labels: [{ label: "B", angle: 90, percent: 0.6 }] },
      },
      {
        id: "basicXY",
        hex: { labels: [{ label: "B", x: 20, y: -15 }] },
      },
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
        id: "basicHidden",
        hex: { labels: [{ label: "B", hidden: true }, { label: "NY" }] },
      },
    ],
  },
  {
    id: "icons",
    examples: [
      { id: "iconCity", hex: { ...city, ...icon } },
      { id: "iconCenterTown", hex: { ...centerTown, ...icon } },
      { id: "iconTerrain", hex: { ...city, ...icon, ...terrain } },
      { id: "iconAlone", hex: icon },
    ],
  },
  {
    id: "terrain",
    examples: [
      { id: "terrainCity", hex: { ...city, ...terrain } },
      { id: "terrainCenterTown", hex: { ...centerTown, ...terrain } },
      { id: "terrainIcon", hex: { ...city, ...terrain, ...icon } },
      { id: "terrainAlone", hex: terrain },
    ],
  },
  {
    id: "values",
    examples: [
      { id: "valueOne", hex: { values: [{ value: 30 }] } },
      { id: "valueTwo", hex: { values: [{ value: 30 }, { value: 40 }] } },
    ],
  },
  {
    id: "labels",
    examples: [
      { id: "labelOne", hex: { labels: [{ label: "B" }] } },
      { id: "labelTwo", hex: { labels: [{ label: "B" }, { label: "NY" }] } },
      {
        id: "labelThree",
        hex: { labels: [{ label: "B" }, { label: "NY" }, { label: "OO" }] },
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
        hex: { towns: [{ mid: "straight", align: "perpendicular" }] },
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
];

const Example = ({ id, hex }) => {
  const { t } = useTranslation();

  return (
    <div
      className="checkered border border-solid flex flex-col rounded-xl overflow-hidden items-center font-display font-bold"
      data-testid={`positioning-${id}`}
    >
      <Svg
        width="175.205"
        height="152"
        viewBox="-87.6025 -76 175.205 152"
        className="m-4"
      >
        <Hex hex={hex} id={id} border={true} bleed={true} />
      </Svg>
      <div className="p-4 text-wrap border-t bg-background w-full">
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
      {map(
        (group) => (
          <section key={group.id} className="mt-8">
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
