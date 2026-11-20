// The random value that binds a Discord login to the browser tab that began
// it. It is kept in sessionStorage (per tab, gone when the tab closes) and, if
// that is blocked, in memory for the page load. The returned fragment is
// accepted only with this value, once.
const KEY = "play-login-nonce";
let memory = null;

export const newNonce = () => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

export const storeNonce = (nonce) => {
  memory = nonce;
  try {
    window.sessionStorage.setItem(KEY, nonce);
  } catch {
    // The in-memory copy serves this page load
  }
};

// The nonce of the login in progress, or null
export const readNonce = () => {
  try {
    return window.sessionStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
};

export const clearNonce = () => {
  memory = null;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing stored
  }
};
