import { omit } from "ramda";

import { isCustomId } from "./assetNames.js";

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
    import("@/schemas/config.schema.json"),
  ]).then(([{ compileSchema, draft07 }, game, tiles, config]) => {
    const root = game.default;
    return {
      compiled: compileSchema(root, {
        drafts: [draft07],
        remotes: [tiles.default],
      }),
      config: compileSchema(config.default, { drafts: [draft07] }),
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
// deprecated. They stay valid, so only a warning is shown. Items of a list are
// "*" (["trains", "*", "players"]). Local $refs, allOf and items are followed,
// each $ref once per path (a definition can contain itself).
export const deprecatedPaths = (
  node,
  root = node,
  path = [],
  followed = new Set(),
) => {
  if (!node || typeof node !== "object") return [];

  if (node.$ref) {
    if (!node.$ref.startsWith("#/") || followed.has(node.$ref)) return [];
    const target = node.$ref
      .slice(2)
      .split("/")
      .reduce((n, part) => n?.[part], root);
    return deprecatedPaths(
      target,
      root,
      path,
      new Set([...followed, node.$ref]),
    );
  }

  return [
    ...Object.entries(node.properties || {}).flatMap(([key, child]) => [
      ...(child.deprecated ? [[...path, key]] : []),
      ...deprecatedPaths(child, root, [...path, key], followed),
    ]),
    ...(node.items
      ? deprecatedPaths(node.items, root, [...path, "*"], followed)
      : []),
    ...(node.allOf || []).flatMap((part) =>
      deprecatedPaths(part, root, path, followed),
    ),
  ];
};

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

// Fields the schema no longer has because they were never used for printing.
// A game that still has one keeps loading and exporting: it is a warning, not
// an unknown field. The path is the object that held the field, "*" is any
// item of a list and "**" any number of levels, so a field of the same name
// elsewhere is not hit.
const TILE_FIELDS = [
  "bgFill",
  "textBorderWidth",
  "textBorderColor",
  "inverseTextColor",
  "encoding",
  "broken",
  "groups",
];

export const REMOVED = [
  [[], ["pools", "floatPercent", "upgrades"]],
  [["info"], ["capitalization", "mustSellInBlocks"]],
  [["companies", "*"], ["subName"]],
  [["trains", "*"], ["discount"]],
  [
    ["privates", "*"],
    ["sym", "debt", "abilities", "image"],
  ],
  ...["tiles", "map"].flatMap((section) => [
    [[section, "**"], TILE_FIELDS],
    [
      [section, "**", "tokens", "*"],
      ["text", "textColor"],
    ],
  ]),
];

// The same for a file of tiles, whose tiles are at the top
export const TILES_REMOVED = [
  [["**"], TILE_FIELDS],
  [
    ["**", "tokens", "*"],
    ["text", "textColor"],
  ],
];

const isObject = (node) =>
  node !== null && typeof node === "object" && !Array.isArray(node);

// The objects of the data a path of REMOVED leads to, with their paths
const objectsAt = (data, pattern, path = []) => {
  if (pattern.length === 0) return isObject(data) ? [[path, data]] : [];
  if (data === null || typeof data !== "object") return [];

  const [head, ...rest] = pattern;
  const children = Object.entries(data).map(([key, child]) => [
    Array.isArray(data) ? Number(key) : key,
    child,
  ]);
  if (head === "**") {
    return [
      ...objectsAt(data, rest, path),
      ...children.flatMap(([key, child]) =>
        objectsAt(child, pattern, [...path, key]),
      ),
    ];
  }
  if (head === "*") {
    return Array.isArray(data)
      ? children.flatMap(([key, child]) =>
          objectsAt(child, rest, [...path, key]),
        )
      : [];
  }
  return isObject(data) && Object.hasOwn(data, head)
    ? objectsAt(data[head], rest, [...path, head])
    : [];
};

// The pointers (#/trains/2/discount) of the removed fields a game still has
export const removedPointers = (data, table = REMOVED) =>
  table.flatMap(([parent, fields]) =>
    objectsAt(data, parent).flatMap(([path, object]) =>
      fields
        .filter((field) => Object.hasOwn(object, field))
        .map(
          (field) =>
            `#/${[...path, field]
              .map((part) =>
                String(part).replace(/~/g, "~0").replace(/\//g, "~1"),
              )
              .join("/")}`,
        ),
    ),
  );

const issue = (code, pointer, params = {}, severity = ERROR) => ({
  severity,
  code,
  pointer: readablePointer(pointer),
  params,
});

const ADDITIONAL = "no-additional-properties-error";

const isRemoved = (e, removed) =>
  e.code === ADDITIONAL && removed.has(e.data.pointer);

// The alternatives of a oneOf/anyOf list their errors together. A removed
// field has its own warning: an alternative that only rejects removed fields
// fits, so there is no error. A field that only some of the others reject is
// allowed by another one, so it is not a mistake, and one every alternative
// rejects is reported once. When that leaves nothing, every alternative has
// its own mistake: report them all.
const alternativeErrors = (errors, count, removed) => {
  const groups = Map.groupBy(errors, (e) => e.data.schema);
  if (
    [...groups.values()].some((group) =>
      group.every((e) => isRemoved(e, removed)),
    )
  ) {
    return [];
  }

  const rest = errors.filter((e) => !isRemoved(e, removed));
  const rejected = new Map();
  for (const e of rest) {
    if (e.code === ADDITIONAL) {
      rejected.set(e.data.pointer, (rejected.get(e.data.pointer) ?? 0) + 1);
    }
  }

  const seen = new Set();
  const unique = (list) =>
    list.filter((e) => {
      if (e.code !== ADDITIONAL) return true;
      if (seen.has(e.data.pointer)) return false;
      seen.add(e.data.pointer);
      return true;
    });
  const agreed = unique(
    rest.filter(
      (e) => e.code !== ADDITIONAL || rejected.get(e.data.pointer) >= count,
    ),
  );
  if (agreed.length) return agreed;
  seen.clear();
  return unique(rest);
};

// Errors of a oneOf/anyOf are the errors of its alternatives. Show the ones
// below the value itself, since the alternatives that do not fit at all only
// say it is not the other type. The pointers in removed are removed fields.
export const leaves = (error, removed = new Set()) => {
  const nested = error.data?.errors;
  if (!nested?.length) return [error];
  const deeper = nested.filter((e) => e.data?.pointer !== error.data.pointer);
  // The alternatives of the type of the value (the others only say, at the
  // value itself, that it is not their type)
  const count =
    (error.data.oneOf ?? error.data.anyOf)?.length -
    nested.filter(
      (e) => e.code === "type-error" && e.data?.pointer === error.data.pointer,
    ).length;
  const shown = deeper.length
    ? count > 1
      ? alternativeErrors(deeper, count, removed)
      : deeper
    : [error];
  return shown.flatMap((e) => (e === error ? [e] : leaves(e, removed)));
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

// The paths in the data a (wildcard) path of the schema leads to
const present = (data, path) => {
  if (path.length === 0) return [[]];
  const [key, ...rest] = path;
  if (data === null || typeof data !== "object") return [];

  if (key === "*") {
    return Array.isArray(data)
      ? data.flatMap((item, index) =>
          present(item, rest).map((tail) => [index, ...tail]),
        )
      : [];
  }
  return key in data
    ? present(data[key], rest).map((tail) => [key, ...tail])
    : [];
};

// A warning for each place in the data of a deprecated path of the schema
export const deprecatedIssues = (deprecated, data) =>
  deprecated.flatMap((path) =>
    present(data, path).map((found) =>
      issue(
        "deprecated",
        `#/${found.join("/")}`,
        { key: path.filter((part) => part !== "*").join("_") },
        WARNING,
      ),
    ),
  );

// The game schema only checks the names of the settings of `config`: the
// values are checked against the config schema. The config of a game is part
// of the settings, so what it lacks is no mistake.
const configErrors = (validator, config) => {
  if (!isObject(config)) return [];
  return validator
    .validate(config)
    .errors.filter((e) => e.code !== "required-property-error")
    .flatMap((e) => leaves(e))
    .filter((e) => e.code !== "required-property-error")
    .map((e) => ({
      ...e,
      data: { ...e.data, pointer: `#/config${e.data.pointer.slice(1)}` },
    }))
    .map(translate);
};

const isString = (value) => typeof value === "string";

// The custom images ("custom/<name>") a game uses, as { kind, id, pointer }:
// the logo and icon of tokens, the type of icon and terrain elements, the
// icons of cities and the image of trains
export const customReferences = (data) => {
  const found = [];
  const add = (kind, id, path) => {
    if (isCustomId(id)) {
      found.push({
        kind,
        id,
        pointer: `#/${path.map((part) => String(part).replace(/~/g, "~0").replace(/\//g, "~1")).join("/")}`,
      });
    }
  };
  const types = (value, path) => {
    const items = Array.isArray(value) ? value : value ? [value] : [];
    items.forEach((item, index) => {
      if (isObject(item) && isString(item.type)) {
        add("icons", item.type, [
          ...path,
          ...(Array.isArray(value) ? [index] : []),
          "type",
        ]);
      }
    });
  };
  const visit = (node, path) => {
    if (Array.isArray(node)) {
      node.forEach((item, index) => visit(item, [...path, index]));
      return;
    }
    if (!isObject(node)) return;
    for (const [key, value] of Object.entries(node)) {
      const here = [...path, key];
      if (key === "logo" && isString(value)) add("logos", value, here);
      else if (key === "icon" && isString(value)) add("icons", value, here);
      else if (key === "image" && isString(value) && path[0] === "trains") {
        add("trains", value, here);
      } else if (key === "icons" && isObject(value)) {
        for (const [num, id] of Object.entries(value)) {
          if (isString(id)) add("icons", id, [...here, num]);
        }
      } else if (key === "icons" || key === "terrain") {
        types(value, here);
      }
      visit(value, here);
    }
  };
  visit(data, []);
  return found;
};

// A warning for each custom image the game names that it does not have
export const assetIssues = (data, assets) =>
  customReferences(data)
    .filter(
      ({ kind, id }) =>
        !Object.hasOwn(assets?.[kind] ?? {}, id.slice("custom/".length)),
    )
    .map(({ kind, id, pointer }) =>
      issue("missing-asset", pointer, { id, kind }, WARNING),
    );

// Every problem of a game: schema errors first, then removed and deprecated
// fields. `assets` (the custom images of the game, see util/assets) is
// optional: without it the custom images are not checked.
export const validateGame = async (game, assets) => {
  const { compiled: validator, config, deprecated } = await schema();
  // meta is added by the app, the schema does not allow it
  const data = omit(["meta"], game);

  const removed = removedPointers(data).map((pointer) =>
    issue("deprecated", pointer, { key: "removed" }, WARNING),
  );
  const gone = new Set(removed.map((e) => e.pointer));
  const removedSet = new Set(removedPointers(data));

  // A removed field is not an unknown field, whether the schema allows it
  // (the companies) or not
  const errors = validator
    .validate(data)
    .errors.flatMap((e) => leaves(e, removedSet))
    // The config schema names the unknown settings of an object config
    .filter(
      (e) =>
        !(
          e.code === "invalid-property-name-error" &&
          e.data?.pointer === "#/config" &&
          isObject(data.config)
        ),
    )
    .map(translate)
    .filter((e) => !gone.has(e.pointer));

  return [
    ...errors,
    ...configErrors(config, data.config),
    ...removed,
    ...deprecatedIssues(deprecated, data),
    ...(assets === undefined ? [] : assetIssues(data, assets)),
  ];
};
