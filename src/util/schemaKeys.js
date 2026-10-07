// The text of the schemas lives in src/locales/schema.<lang>.json. A schema
// holds a key (schema.game.exports.layouts) where it has a description or a
// deprecation message, and these functions put the text back.
export const SCHEMA_KEY = /^schema\.[\w.-]+$/;

// The keywords of a schema that hold text, and the ones that hold data that
// only looks like a schema
const TEXT_KEYWORDS = ["description", "deprecationMessage"];
const DATA_KEYWORDS = ["default", "examples", "const", "enum"];

const isKey = (value) => typeof value === "string" && SCHEMA_KEY.test(value);

// A copy of the schema in the same key order, with the text of every key from
// lookup
const mapKeys = (node, lookup) => {
  if (Array.isArray(node)) return node.map((part) => mapKeys(part, lookup));
  if (node === null || typeof node !== "object") return node;
  return Object.fromEntries(
    Object.entries(node).map(([name, value]) => [
      name,
      TEXT_KEYWORDS.includes(name) && isKey(value)
        ? lookup(value)
        : DATA_KEYWORDS.includes(name)
          ? value
          : mapKeys(value, lookup),
    ]),
  );
};

// Every key a schema uses, once, in the order of the schema
export const schemaKeys = (schema) => {
  const found = new Set();
  mapKeys(schema, (key) => {
    found.add(key);
    return key;
  });
  return [...found];
};

// The schema with the text of every key, from an object of keys to texts. An
// unknown key is a mistake of the schema: it throws.
export const resolveSchemaKeys = (schema, strings) =>
  mapKeys(schema, (key) => {
    if (!Object.hasOwn(strings, key)) {
      throw new Error(`Unknown schema key ${key}`);
    }
    return strings[key];
  });
