import { getTile, tileColors } from "@/util";
import { getMapHexes, maxMapX, maxMapY } from "@/util/map";

const addGauges = (counts, track, count) => {
  const gauges = new Set((track || []).map((t) => t.gauge || "normal"));
  gauges.forEach((gauge) => {
    counts[gauge] = (counts[gauge] || 0) + count;
  });
};

const colorOrder = (color) => {
  const i = tileColors.indexOf(color);
  return i === -1 ? tileColors.length : i;
};

// Counts shown on the game info page: tiles by color, track gauges (tiles and
// map combined), map variations and size, companies, privates and extras.
const gameStats = (game, tileDefs) => {
  const gauges = {};
  const byColor = {};
  let tileTotal = 0;

  Object.keys(game.tiles || {}).forEach((id) => {
    const tile = getTile(tileDefs, game.tiles, id);
    if (!tile || !tile.color) return;
    const entry = (byColor[tile.color] ||= {
      color: tile.color,
      types: 0,
      total: 0,
    });
    entry.types += 1;
    entry.total += tile.quantity;
    tileTotal += tile.quantity;
    addGauges(gauges, tile.track, tile.quantity);
  });

  const variations = game.map
    ? Array.isArray(game.map)
      ? game.map.length
      : 1
    : 0;

  const sizes = [];
  let mapHexes = 0;
  let largest = 0;
  for (let v = 0; v < variations; v++) {
    const hexes = getMapHexes(game, v);
    const count = hexes.reduce((n, hex) => n + hex.hexes.length, 0);
    sizes.push(
      count ? { width: maxMapX(hexes), height: maxMapY(hexes) } : null,
    );
    if (count > mapHexes || v === 0) {
      mapHexes = count;
      largest = v;
    }
  }
  // Gauges count the hexes of the largest variation once
  getMapHexes(game, largest).forEach((hex) =>
    addGauges(gauges, hex.track, hex.hexes.length),
  );

  const companies = game.companies || [];
  const minors = companies.filter((c) => c.minor).length;
  const trains = game.trains || [];

  return {
    tiles: {
      total: tileTotal,
      colors: Object.values(byColor).sort(
        (a, b) => colorOrder(a.color) - colorOrder(b.color),
      ),
    },
    gauges: Object.keys(gauges).some((g) => g !== "normal")
      ? Object.entries(gauges).map(([gauge, count]) => ({ gauge, count }))
      : [],
    map: { variations, hexes: mapHexes, sizes: sizes.filter(Boolean) },
    companies: {
      total: companies.length,
      major: companies.length - minors,
      minor: minors,
    },
    privates: (game.privates || []).length,
    trains: {
      types: trains.length,
      total: trains.reduce((n, t) => n + (t.quantity || 1), 0),
    },
    phases: (game.phases || []).length,
    rounds: (game.rounds || []).length,
  };
};

export default gameStats;
