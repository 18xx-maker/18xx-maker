// A minimal browser global for the node (unit) project, in place of jsdom.
//
// Import it FIRST in a test file that needs it: modules such as
// util/capability read `window` while they are imported, which is before any
// beforeEach runs. `window` is the global object itself, so `vi.stubGlobal`
// and plain `window.x = ...` see the same values, and it survives
// `vi.resetModules()`.

const DATA = Symbol("data");

// The Storage class: tests spy on its prototype (vi.spyOn(Storage.prototype,
// "setItem")) like they would in a browser.
class Storage {
  getItem(key) {
    const data = this[DATA];
    return data.has(String(key)) ? data.get(String(key)) : null;
  }
  setItem(key, value) {
    this[DATA].set(String(key), String(value));
  }
  removeItem(key) {
    this[DATA].delete(String(key));
  }
  clear() {
    this[DATA].clear();
  }
  key(index) {
    return [...this[DATA].keys()][index] ?? null;
  }
}

// An in-memory Storage. Keys are enumerable own properties (Object.keys works)
// and the methods do not depend on the `this` they are called with.
const createStorage = () => {
  const data = new Map();
  const proxy = new Proxy(Object.create(Storage.prototype), {
    get: (target, prop, receiver) => {
      if (prop === DATA) return data;
      if (prop === "length") return data.size;
      if (typeof prop === "string" && data.has(prop)) return data.get(prop);
      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" && prop !== "constructor"
        ? (...args) => Reflect.get(Storage.prototype, prop).apply(proxy, args)
        : value;
    },
    set: (_, prop, value) => {
      data.set(String(prop), String(value));
      return true;
    },
    deleteProperty: (_, prop) => {
      data.delete(prop);
      return true;
    },
    has: (target, prop) => data.has(prop) || prop in target,
    ownKeys: () => [...data.keys()],
    getOwnPropertyDescriptor: (_, prop) =>
      data.has(prop)
        ? {
            value: data.get(prop),
            writable: true,
            enumerable: true,
            configurable: true,
          }
        : undefined,
  });
  return proxy;
};

const define = (name, value) =>
  Object.defineProperty(globalThis, name, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });

// Back to a clean window: no api, picker or render input, an empty
// localStorage and the given location.
export const resetWindow = ({ location = {} } = {}) => {
  delete globalThis.api;
  delete globalThis.showOpenFilePicker;
  delete globalThis.showSaveFilePicker;
  delete globalThis.__RENDER_INPUT__;
  globalThis.location = { hostname: "localhost", ...location };
  globalThis.localStorage.clear();
};

if (globalThis.window !== globalThis) {
  define("window", globalThis);
  define("Storage", Storage);
  define("localStorage", createStorage());
  define("location", { hostname: "localhost" });
}
