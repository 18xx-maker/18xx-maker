import { forEach, objOf, pick, reduce } from "ramda";

// What keys do we care about
let keys = new Set();

const init = (...args) => {
  keys = Array.from(new Set(args));
};
const getKeys = () => keys;

const initialState = () => {
  return reduce(
    (acc, key) => {
      try {
        // Grab value from localStorage
        const value = window.localStorage.getItem(key);

        if (value) {
          return { ...acc, ...objOf(key, JSON.parse(value)) };
        }
      } catch (e) {
        console.error(e);
      }

      return acc;
    },
    {},
    keys,
  );
};

let current;
let writeFailed = false;
const listen = (store) => {
  store.subscribe(() => {
    let previous = current;
    current = pick(keys, store.getState());

    forEach((key) => {
      if (!previous || previous[key] !== current[key]) {
        try {
          if (current[key] === undefined) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, JSON.stringify(current[key]));
          }
        } catch (e) {
          // Full, blocked or private: the state stays in memory
          if (!writeFailed) {
            writeFailed = true;
            console.error(e);
          }
        }
      }
    }, keys);
  });
};

export default {
  getKeys,
  init,
  initialState,
  listen,
};
