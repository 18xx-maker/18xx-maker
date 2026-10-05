const isObject = (o) => typeof o === "object" && o !== null;
const isEmpty = (o) => isObject(o) && Object.keys(o).length === 0;
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// Deep diff of two JSON values. Changed and added keys carry the new value,
// removed keys are `undefined`, arrays diff as index-keyed objects.
export const diff = (lhs, rhs) => {
  if (lhs === rhs) return {};
  if (!isObject(lhs) || !isObject(rhs)) return rhs;

  const out = {};
  for (const k of Object.keys(lhs)) {
    if (!has(rhs, k)) out[k] = undefined;
  }
  for (const k of Object.keys(rhs)) {
    if (!has(lhs, k)) {
      out[k] = rhs[k];
      continue;
    }
    const d = diff(lhs[k], rhs[k]);
    if (isEmpty(d) && (isEmpty(lhs[k]) || !isEmpty(rhs[k]))) continue;
    out[k] = d;
  }
  return out;
};
