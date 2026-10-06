import { jsonLanguage } from "@codemirror/lang-json";

import { equals, omit } from "ramda";

// The pure parts of the JSON editor of the edit panel (JsonEditor.jsx): reading
// the text, deciding whether it can replace the game and finding the places
// in the text that issues of the game point to.

// Reads the text of a game file. A failure has the line and column (counted
// from 1) of the problem and the parser's own message as detail.
export const parseGameText = (text) => {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    const message = String(e.message);
    const position = /position (\d+)/.exec(message)?.[1];
    const lineColumn = /line (\d+) column (\d+)/.exec(message);
    const offset = Math.min(
      position === undefined ? text.length : Number(position),
      text.length,
    );
    const before = text.slice(0, offset).split("\n");
    const [line, column] = lineColumn
      ? [Number(lineColumn[1]), Number(lineColumn[2])]
      : [before.length, before.at(-1).length + 1];
    return { ok: false, line, column, offset, detail: message };
  }
};

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// What keeps a parsed value from being the game the pages render: the part
// that is not an object ("root", "info") or a title that is not a string. The
// rest of the schema only warns.
export const invalidReason = (value) => {
  if (!isObject(value)) return "root";
  if (!isObject(value.info)) return "info";
  if (typeof value.info.title !== "string") return "title";
  return null;
};

// The one change that turns the old text into the new one: what the first and
// last characters have in common stays
export const minimalChange = (oldText, newText) => {
  if (oldText === newText) return null;

  let start = 0;
  const shortest = Math.min(oldText.length, newText.length);
  while (start < shortest && oldText[start] === newText[start]) start++;

  let end = 0;
  while (
    end < shortest - start &&
    oldText[oldText.length - 1 - end] === newText[newText.length - 1 - end]
  ) {
    end++;
  }

  return {
    from: start,
    to: oldText.length - end,
    insert: newText.slice(start, newText.length - end),
  };
};

// The meta is not part of the game file and not shown
export const sameGame = (a, b) => equals(omit(["meta"], a), omit(["meta"], b));

// The edited game with the old value of every top level key that did not
// change, so what depends on those keys does not compute again
export const shareUnchanged = (previous, next) =>
  Object.fromEntries(
    Object.entries(next).map(([key, value]) => [
      key,
      key in previous && equals(previous[key], value) ? previous[key] : value,
    ]),
  );

export const MIN_DELAY = 300;

// Time to wait for more typing before the text is applied: longer after a
// slow apply, so a big game does not get one on every keystroke
export const debounceDelay = (lastApply = 0) =>
  Math.max(MIN_DELAY, 2 * lastApply);

// "map.hexes[0].color" is ["map", "hexes", "0", "color"]
export const pointerParts = (pointer = "") =>
  pointer.split(/[.[\]]/).filter((part) => part !== "");

const VALUES = ["Object", "Array", "String", "Number", "True", "False", "Null"];
const isValue = (node) => VALUES.includes(node.name);

const valueOf = (node) => {
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (isValue(child)) return child;
  }
  return null;
};

const propertyValue = (property) => {
  let value = null;
  for (let child = property.firstChild; child; child = child.nextSibling) {
    if (isValue(child)) value = child;
  }
  return value;
};

const propertyName = (property, text) => {
  const name = property.getChild("PropertyName");
  if (!name) return null;
  try {
    return JSON.parse(text.slice(name.from, name.to));
  } catch {
    return null;
  }
};

export const parseTree = (text) => jsonLanguage.parser.parse(text);

// The range of the text a pointer of a problem ("map.hexes[0].color") is
// about: the value, or the name of the property when the value is a list or
// an object. A part that does not exist gives its nearest parent, the root
// the first line.
export const pointerToRange = (tree, text, pointer) => {
  const first = text.indexOf("\n");
  const fallback = { from: 0, to: first === -1 ? text.length : first };
  const root = valueOf(tree.topNode);
  if (!root) return fallback;

  let node = root;
  let name = null;
  for (const part of pointerParts(pointer)) {
    let next = null;
    let nextName = null;
    if (node.name === "Object") {
      for (let c = node.firstChild; c; c = c.nextSibling) {
        if (c.name === "Property" && propertyName(c, text) === part) {
          next = propertyValue(c);
          nextName = c.getChild("PropertyName");
        }
      }
    } else if (node.name === "Array" && /^\d+$/.test(part)) {
      let index = 0;
      for (let c = node.firstChild; c; c = c.nextSibling) {
        if (isValue(c) && index++ === Number(part)) next = c;
      }
      nextName = null;
    }
    if (!next) break;
    node = next;
    name = nextName ?? name;
  }

  if (node === root) return fallback;
  const target =
    (node.name === "Object" || node.name === "Array") && name ? name : node;
  return { from: target.from, to: target.to };
};

// The ranges of the names that are used twice in an object: JSON.parse keeps
// the last, and formatting writes it without the others
export const duplicateKeys = (tree, text) => {
  const found = [];
  tree.iterate({
    enter: (node) => {
      if (node.name !== "Object") return;
      const seen = new Set();
      for (let c = node.node.firstChild; c; c = c.nextSibling) {
        if (c.name !== "Property") continue;
        const name = propertyName(c, text);
        if (name === null) continue;
        if (seen.has(name)) {
          const key = c.getChild("PropertyName");
          found.push({ from: key.from, to: key.to });
        }
        seen.add(name);
      }
    },
  });
  return found;
};

// More digits than a double keeps (15 are safe). Writing the parsed number
// again would change it.
const lossy = (literal) => {
  const mantissa = literal.replace(/^-/, "").split(/[eE]/)[0];
  const digits = mantissa
    .replace(".", "")
    .replace(/^0+/, "")
    .replace(/0+$/, "");
  return digits.length > 15;
};

// The ranges of numbers that parsing and formatting would round
export const lossyNumbers = (tree, text) => {
  const found = [];
  tree.iterate({
    enter: (node) => {
      if (node.name === "Number" && lossy(text.slice(node.from, node.to))) {
        found.push({ from: node.from, to: node.to });
      }
    },
  });
  return found;
};
