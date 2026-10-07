// A plain ES module with no imports: the app and the Electron main process
// both use it (#util/filename).
export const MAX_FILENAME = 100;

// The codes of the errors of saving a game under a name the user typed
export const NAME_INVALID = "invalid";
export const NAME_EXISTS = "exists";

const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
// Letters and digits of any script, space, dot, underscore and dash: nothing
// that has a meaning in a URL or a path
const URL_UNSAFE = /[^\p{L}\p{N} ._-]/gu;
// eslint-disable-next-line no-control-regex -- control characters are the point
const FILE_UNSAFE = /[\u0000-\u001f\u007f<>:"/\\|?*]/g;

// The name of a game file without its path and its .json extension, or "" when
// nothing usable is left. With urlSafe it only keeps characters that are safe
// in a URL, so it can be the id of a game in its slug.
export const sanitizeFilename = (name, { urlSafe = false } = {}) => {
  const base = String(name ?? "")
    .split(/[/\\]/)
    .pop()
    .replace(urlSafe ? URL_UNSAFE : FILE_UNSAFE, "")
    .trim()
    .replace(/\.json$/i, "")
    .replace(/^[. ]+|[. ]+$/g, "")
    .slice(0, MAX_FILENAME)
    .replace(/[. ]+$/, "");

  return RESERVED.test(base.split(".")[0]) ? "" : base;
};
