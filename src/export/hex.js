const is = require('ramda/src/is');
const addIndex = require('ramda/src/addIndex');
const concat = require('ramda/src/concat');
const map = require('ramda/src/map');
const chain = require('ramda/src/chain');
const find = require('ramda/src/find');

const terrainMapping = {
  river: "water",
  stream: "water"
};

const getValues = hex => {
  if (!hex.values) {
    return [];
  }

  return map(v => v.value, hex.values);
}

const compileValue = hex => {
  if (!hex.values) {
    return [];
  }
};

const compileTowns = hex => {
  if (!hex.centerTowns && !hex.towns) {
    return [];
  }

  let values = getValues(hex);

  return addIndex(map)((t,i) => {
    return "t=r:" + (values[i] || values[0] || 0);
  }, concat(hex.centerTowns || [], hex.towns || []));
}

const compileCities = hex => {
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

const compileTerrain = hex => {
  if (!hex.terrain) {
    return [];
  }

  let types = chain(t => {
    if (t.type) {
      return [terrainMapping[t.type] || t.type]
    }
    return [];
  }, hex.terrain);

  let result = [];
  let cost = find(t => t.cost, hex.terrain);
  if (cost) {
    result.push(`u=c:${cost.cost}`);
  }

  if (types.length > 0) {
    result.push(`t:${types.join("+")}`);
  }

  return [result.join(",")];
};

const compileOffboard = hex => {
  if (!hex.offBoardRevenue) {
    return [];
  }

  let colors = map(r => {
    if (r.cost.match(/^D/)) {
      return `diesel_${r.cost.replace(/^D/, '')}`;
    }
    return `${r.color}_${r.cost}`;
  }, hex.offBoardRevenue.revenues);

  return [`o=r:${colors.join("|")}`];
};

const arev = (a, rev) => {
  a = (a - 1) % 6;

  return `p=a:${a},b:_${rev}`;
};

const ab = (a, b) => {
  a = (a - 1) % 6;

  if (b === null || b === undefined) {
    return `p=a:${a},b:_0`;
  }

  b = (b - 1) % 6;

  return `p=a:${Math.min(a,b)},b:${Math.max(a,b)}`;
};

const compileLabels = hex => {
  if (!hex.labels) {
    return [];
  }

  return map(l => {
    return `l=${l.label}`;
  }, hex.labels);
}

const compileTrack = hex => {
  if (!hex.track) {
    return [];
  }

  // Hack for now. If there are values on the hex than cut the track in half
  let hasRevenue = (hex.values || []).length > 0;

  return chain(t => {
    switch (t.type) {
      case "sharp":
        return hasRevenue ? [arev(t.side, t.revenue || 0),
                             arev(t.side + 1, t.revenue || 0)]
          : [ab(t.side, t.side + 1)];
      case "gentle":
        return hasRevenue ? [arev(t.side, t.revenue || 0),
                             arev(t.side + 2, t.revenue || 0)]
          : [ab(t.side, t.side + 2)];
      case "straight":
        return hasRevenue ? [arev(t.side, t.revenue || 0),
                             arev(t.side + 3, t.revenue || 0)]
          : [ab(t.side, t.side + 3)];
      default:
        return [arev(t.side, t.revenue || 0)];
    }
  }, hex.track);
};

const compileColor = hex => {
  switch(hex.color) {
  case "water":
    return "blue";
  case "offboard":
    return "red";
  case "plain":
    return "white";
  default:
    return hex.color;
  }
};

const compileHex = hex => {
  if (hex.encoding) {
    return hex.encoding;
  }

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

exports.compileColor = compileColor;
exports.compileHex = compileHex;
