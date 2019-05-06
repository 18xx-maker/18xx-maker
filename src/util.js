import adjust from "ramda/src/adjust";
import append from "ramda/src/append";
import chain from "ramda/src/chain";
import compose from "ramda/src/compose";
import curry from "ramda/src/curry";
import drop from "ramda/src/drop";
import find from "ramda/src/find";
import fromPairs from "ramda/src/fromPairs";
import head from "ramda/src/head";
import is from "ramda/src/is";
import isEmpty from "ramda/src/isEmpty";
import join from "ramda/src/join";
import juxt from "ramda/src/juxt";
import lte from "ramda/src/lte";
import map from "ramda/src/map";
import prepend from "ramda/src/prepend";
import propOr from "ramda/src/propOr";
import reverse from "ramda/src/reverse";
import tail from "ramda/src/tail";
import take from "ramda/src/take";
import toPairs from "ramda/src/toPairs";
import toUpper from "ramda/src/toUpper";

export const capitalize = compose(
  join(''),
  juxt([compose(toUpper, head), tail])
);

export const mapKeys = curry((fn, obj) =>
  fromPairs(map(adjust(0, fn), toPairs(obj))));

export const groupsOf = curry(function group(n, list) {
  return isEmpty(list)
    ? []
    : prepend(take(n, list), group(n, drop(n, list)));
});

export const linear = curry((percent, p1, p2) => [
  p1[0] * percent + p2[0] * (1.0 - percent),
  p1[1] * percent + p2[1] * (1.0 - percent)
]);

export const midpoint = linear(0.5);

export const pointsToString = compose(
  join(" "),
  map(join(","))
);

export const inchesToCss = inches => `${inches}in`;
export const mmToCss = inches => `${inches}mm`;
export const inchesToMm = inches => inches * 25.4;
export const unitsToInches = units => units / 100.0;
export const unitsToCss = compose(inchesToCss, unitsToInches);
export const unitsToCssMm = compose(mmToCss, inchesToMm, unitsToInches);


export const printableWidth = ({width, margins}) => {
  let margin = 0;
  if (is(Number, margins)) {
    margin += (2 * margins);
  } else {
    margin += (margins.left + margins.right);
  }

  return width - margin;
};

export const printableHeight = ({height, margins}) => {
  let margin = 0;
  if (is(Number, margins)) {
    margin += (2 * margins);
  } else {
    margin += (margins.top + margins.bottom);
  }

  return height - margin;
};

export const trackType = track => {
  if (track.end === undefined && track.start === undefined) {
    return null;
  } else if (track.end === undefined) {
    return "city";
  } else if (track.start === undefined) {
    return "stop";
  } else {
    let diff = Math.abs(track.start - track.end);
    if (diff > 3) {
      diff = Math.abs(6 - diff);
    }

    switch (diff) {
      case 1:
        return "sharp";
      case 2:
        return "gentle";
      case 3:
        return "straight";
      default:
        return "city";
    }
  }
};

export const fillArray = curry((getNumber, array) => {
  return chain(a => Array(getNumber(a)).fill(a), array);
});

export const marketColor = curry((limits, value) => {
  return propOr(
    "plain",
    "color",
    find(limit => lte(value, limit.value), reverse(limits))
  );
});

export const equalPages = (total, page) => {
  let pages = Math.ceil(total/page);

  let result = new Array(pages);
  result.fill(total/pages);
  return result;
};

export const maxPages = (total, page) => {
  let helper = (total, page, result) => {
    if(total <= page) {
      return append(total, result);
    } else if(total <= (2 * page)) {
      let width = total * 0.5;
      return prepend(width, append(width, result));
    } else {
      return helper(total - page, page, append(page, result));
    }
  };

  return helper(total, page, []);
};
