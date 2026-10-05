import { omit } from "ramda";

// Checks a game file against the game schema and turns what is wrong into
// issues the app can show: { severity, code, pointer, params }. The text comes
// from the locale files (problems.<code>), never from here.

export const ERROR = "error";
export const WARNING = "warning";

// The schema is only needed once a game was loaded, and is compiled once
let compiled;
const schema = () => {
  compiled ||= Promise.all([
    import("json-schema-library"),
    import("@/schemas/game.schema.json"),
    import("@/schemas/tiles.defs.json"),
  ]).then(([{ compileSchema, draft07 }, game, tiles]) => {
    const root = game.default;
    return {
      compiled: compileSchema(root, {
        drafts: [draft07],
        remotes: [tiles.default],
      }),
      deprecated: deprecatedPaths(root),
    };
  });
  // A failed load (offline, a stale chunk) is tried again by the next check
  compiled.catch(() => {
    compiled = undefined;
  });
  return compiled;
};

// The paths (["exports", "paginated"]) of the properties the schema marks
// deprecated. They stay valid, so only a warning is shown.
export const deprecatedPaths = (node, path = []) =>
  Object.entries(node.properties || {}).flatMap(([key, child]) => [
    ...(child.deprecated ? [[...path, key]] : []),
    ...deprecatedPaths(child, [...path, key]),
  ]);

// "#/map/hexes/0/color" is map.hexes[0].color
export const readablePointer = (pointer = "") =>
  pointer
    .replace(/^#\/?/, "")
    .split("/")
    .filter((part) => part !== "")
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"))
    .reduce(
      (path, part) =>
        /^\d+$/.test(part)
          ? `${path}[${part}]`
          : path
            ? `${path}.${part}`
            : part,
      "",
    );

const MAX_VALUE = 40;
export const shorten = (value) => {
  const text =
    typeof value === "string" ? `"${value}"` : (JSON.stringify(value) ?? "");
  return text.length > MAX_VALUE ? `${text.slice(0, MAX_VALUE - 1)}…` : text;
};

const distance = (a, b) => {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        previous[j] + 1,
        row[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = row;
  }
  return previous[b.length];
};

const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

// The one allowed field the unknown field most likely was meant to be, or
// undefined when none is close or several are equally close
export const closest = (field, allowed = []) => {
  const wanted = normalize(field);
  const scored = allowed
    .map((name) => [name, distance(wanted, normalize(name))])
    .sort((a, b) => a[1] - b[1]);
  const limit = Math.max(1, Math.floor(wanted.length / 3));

  if (!scored.length || scored[0][1] > limit) return undefined;
  if (scored[1] && scored[1][1] === scored[0][1]) return undefined;
  return scored[0][0];
};

const issue = (code, pointer, params = {}, severity = ERROR) => ({
  severity,
  code,
  pointer: readablePointer(pointer),
  params,
});

// Errors of a oneOf/anyOf are the errors of its alternatives. Show the ones
// below the value itself, since the alternatives that do not fit at all only
// say it is not the other type.
const leaves = (error) => {
  const nested = error.data?.errors;
  if (!nested?.length) return [error];
  const deeper = nested.filter((e) => e.data?.pointer !== error.data.pointer);
  return (deeper.length ? deeper : [error]).flatMap((e) =>
    e === error ? [e] : leaves(e),
  );
};

const translate = (error) => {
  const { code, data = {} } = error;
  const pointer = data.pointer;

  switch (code) {
    case "no-additional-properties-error": {
      const suggestion = closest(data.property, data.properties);
      return suggestion
        ? issue("unknown-field-suggest", pointer, {
            field: data.property,
            suggestion,
          })
        : issue("unknown-field", pointer, { field: data.property });
    }
    case "type-error":
      return issue("type", pointer, {
        expected: [].concat(data.expected).join(" / "),
        found: data.received,
        value: shorten(data.value),
      });
    case "enum-error":
      return issue("enum", pointer, {
        value: shorten(data.value),
        values: (data.values || data.schema?.enum || []).join(", "),
      });
    case "required-property-error":
      return issue("required", pointer, { field: data.key });
    default:
      return issue("generic", pointer, {
        message: String(error.message || code).replace(/`/g, "'"),
      });
  }
};

const present = (data, path) => {
  let node = data;
  for (const key of path) {
    if (node === null || typeof node !== "object" || !(key in node)) {
      return false;
    }
    node = node[key];
  }
  return true;
};

// Every problem of a game: schema errors first, then deprecated fields
export const validateGame = async (game) => {
  const { compiled: validator, deprecated } = await schema();
  // meta is added by the app, the schema does not allow it
  const data = omit(["meta"], game);

  const errors = validator.validate(data).errors.flatMap(leaves).map(translate);

  const warnings = deprecated
    .filter((path) => present(data, path))
    .map((path) =>
      issue(
        "deprecated",
        `#/${path.join("/")}`,
        { key: path.join("_") },
        WARNING,
      ),
    );

  return [...errors, ...warnings];
};
