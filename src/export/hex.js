import is from "ramda/src/is";
import addIndex from "ramda/src/addIndex";
import concat from "ramda/src/concat";
import map from "ramda/src/map";
import chain from "ramda/src/chain";
import find from "ramda/src/find";

const terrainMapping = {
  water: "wtr",
  river: "wtr",
  stream: "wtr",
  mountain: "mtn"
};

const getValues = hex => {
  if (!hex.values) {
    return [];
  }

  return map(v => v.value, hex.values);
}

export const compileValue = hex => {
  if (!hex.values) {
    return [];
  }
};

export const compileTowns = hex => {
  if (!hex.centerTowns && !hex.towns) {
    return [];
  }

  let values = getValues(hex);

  return addIndex(map)((t,i) => {
    return "t=r:" + (values[i] || values[0] || 0);
  }, concat(hex.centerTowns || [], hex.towns || []));
}

export const compileCities = hex => {
  if (!hex.cities) {
    return [];
  }

  let values = getValues(hex);

  return addIndex(map)((c,i) => {
    let city = "c=r:" + (values[i] || values[0] || 0);
    if (c.size > 1) {
      city += `,s:${c.size}`;
    }
    return city;
  }, hex.cities);
}

export const compileTerrain = hex => {
  if (!hex.terrain) {
    return [];
  }

  let types = chain(t => {
    if (t.type && terrainMapping[t.type]) {
      return [terrainMapping[t.type]];
    }
    return [];
  }, hex.terrain);

  let result = "u=c:";
  if (types.length > 0) {
    result = types.join("+");
  }

  let cost = find(t => t.cost, hex.terrain);
  if (cost) {
    result += cost.cost;
  }

  return [result];
};

export const compileOffboard = hex => {
  if (!hex.offBoardRevenue) {
    return [];
  }

  let colors = map(r => {
    if (r.cost.match(/^D/)) {
      return `diesel_${r.cost.replace(/^D/, '')}`;
    }
    return `${r.color}_${r.cost}`;
  }, hex.offBoardRevenue.revenues);

  return [`o=${colors.join("|")}`];
};

const ab = (a, b) => {
  a = (a - 1) % 6;

  if (b === null || b === undefined) {
    return `p=a:${a},b:_0`;
  }

  b = (b - 1) % 6;

  return `p=a:${Math.min(a,b)},b:${Math.max(a,b)}`;
};

export const compileLabels = hex => {
  if (!hex.labels) {
    return [];
  }

  return map(l => {
    return `l=${l.label}`;
  }, hex.labels);
}

export const compileTrack = hex => {
  if (!hex.track) {
    return [];
  }

  return map(t => {
    switch (t.type) {
    case "sharp":
      return ab(t.side, t.side + 1);
    case "gentle":
      return ab(t.side, t.side + 2);
    case "straight":
      return ab(t.side, t.side + 3);
    default:
      return ab(t.side);
    }
  }, hex.track);
};

export const compileColor = hex => {
  switch(hex.color) {
  case "offboard":
    return "red";
  case "plain":
    return "white";
  default:
    return hex.color;
  }
};

export const compileHex = hex => {
  let all = [
    ...compileOffboard(hex),
    ...compileCities(hex),
    ...compileTowns(hex),
    ...compileTrack(hex),
    ...compileLabels(hex),
    ...compileTerrain(hex)
  ];

  let result = all.join(";");

  switch (result) {
  case "":
    return "blank";
  case "c=r:0":
    return "city";
  case "t=r:0":
    return "town";
  default:
    return result;
  }

  return result;
}
