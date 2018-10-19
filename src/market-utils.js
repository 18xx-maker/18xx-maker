import * as R from "ramda";
import * as accounting from "accounting";

export const normalize = R.map(
  R.map(
    R.ifElse(
      R.isNil,
      R.identity,
      R.compose(
        R.converge(R.assoc("value"), [
          R.compose(
            accounting.parse,
            R.prop("label")
          ),
          R.identity
        ]),
        R.ifElse(R.is(Object), R.identity, R.objOf("label"))
      )
    )
  )
);

export const height = R.length;
export const width = R.reduce((acc, row) => {
  return R.max(acc, R.length(row));
}, 0);

export const cell = R.curry((x, y, market) => {
  if (x < 0 || x >= width(market) || y < 0 || y >= height(market)) {
    return undefined;
  } else {
    return R.compose(
      R.nth(x),
      R.nth(y)
    )(market);
  }
});

export const value = R.compose(
  R.defaultTo(undefined),
  R.ifElse(R.is(Object), R.prop("value"), R.identity)
);

export const values = R.compose(
  R.map(value),
  R.flatten
);

export const min = R.compose(
  R.reduce(R.min, Infinity),
  values
);
export const max = R.compose(
  R.reduce(R.max, -Infinity),
  values
);

// Please see https://boardgamegeek.com/image/918588/clearclaw
export const delta = (x, y, market) => {
  let n0 = value(cell(x, y, market));
  let nl = value(cell(x - 1, y, market));
  let nd = value(cell(x, y + 1, market));

  if (!nl && !nd) {
    nl = nd = n0;
  } else if (!nl) {
    nl = nd;
  } else if (!nd) {
    nd = nl;
  }

  let d = (n0 / ((nl + nd) / 2.0) - 1.0) * 100.0;
  return Math.round(d);
};
