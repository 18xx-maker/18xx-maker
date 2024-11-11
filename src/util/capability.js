// Are we running in electron?
// If so we know exactly what we can do.
const electron =
  typeof navigator === "undefined"
    ? false
    : /electron/i.test(navigator.userAgent);

// What APIs are available?
const storage =
  typeof navigator === "object" && typeof navigator.storage === "object";
const idb = typeof indexedDB === "object";
const opfs = storage && typeof navigator.storage.getDirectory === "function";
const file_system_api = typeof window.showOpenFilePicker === "function";

// Full game capabilities
const internal = opfs;
const system = idb && file_system_api;

export default {
  electron,
  internal,
  system,
  apis: {
    storage,
    idb,
    opfs,
    file_system_api,
  },
};
