import { useTranslation } from "react-i18next";

import { tiles as tileDefs } from "@/data";
import { useGame } from "@/hooks";
import gameStats from "@/util/gameStats";

const Section = ({ title, rows }) =>
  rows.length > 0 && (
    <div className="my-4">
      <h4 className="font-bold mb-1">{title}</h4>
      <dl className="grid grid-cols-[1fr_auto] gap-x-8">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt>{label}</dt>
            <dd className="text-right tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );

const GameStats = () => {
  const game = useGame();
  const { t } = useTranslation();
  const stats = gameStats(game, tileDefs);

  const colorLabel = (color) =>
    t(`game.stats.${color}`, { defaultValue: t("game.stats.other") });

  const tiles = stats.tiles.total
    ? [
        ...stats.tiles.colors.map((c) => [
          colorLabel(c.color),
          t("game.stats.tileCount", { total: c.total, types: c.types }),
        ]),
        [t("game.stats.tiles"), stats.tiles.total],
      ]
    : [];

  const map = stats.map.variations
    ? [
        [t("game.stats.variations"), stats.map.variations],
        [t("game.stats.hexes"), stats.map.hexes],
        ...(stats.map.sizes.length
          ? [
              [
                t("game.stats.size"),
                stats.map.sizes
                  .map((s) => t("game.stats.sizeValue", s))
                  .join(" / "),
              ],
            ]
          : []),
      ]
    : [];

  const companies = [
    ...(stats.companies.total
      ? [
          [t("game.stats.companies"), stats.companies.total],
          [t("game.stats.major"), stats.companies.major],
          [t("game.stats.minor"), stats.companies.minor],
        ]
      : []),
    ...(stats.privates ? [[t("game.stats.privates"), stats.privates]] : []),
  ];

  const extras = [
    ...(stats.trains.types
      ? [[t("game.stats.trains"), t("game.stats.trainCount", stats.trains)]]
      : []),
    ...(stats.phases ? [[t("game.stats.phases"), stats.phases]] : []),
    ...(stats.rounds ? [[t("game.stats.rounds"), stats.rounds]] : []),
  ];

  const sections = [
    [t("game.stats.tiles"), tiles],
    [
      t("game.stats.gauges"),
      stats.gauges.map(({ gauge, count }) => [
        gauge === "normal" ? t("game.stats.normal") : gauge,
        count,
      ]),
    ],
    [t("game.stats.map"), map],
    [t("game.stats.companies"), companies],
    [t("game.stats.extras"), extras],
  ];

  if (sections.every(([, rows]) => rows.length === 0)) return null;

  return (
    <div
      className="px-4 border rounded-xl my-4 max-w-lg"
      data-testid="game-stats"
    >
      <h3 className="font-bold mt-4">{t("game.stats.title")}</h3>
      {sections.map(([title, rows]) => (
        <Section key={title} title={title} rows={rows} />
      ))}
    </div>
  );
};

export default GameStats;
