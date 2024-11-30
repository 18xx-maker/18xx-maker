import {
  chain,
  complement,
  compose,
  concat,
  filter,
  isEmpty,
  path,
  replace,
  split,
} from "ramda";

import schema from "@/schemas/config.schema.json";

export const getPath = split(".");
export const getSchemaPath = compose(
  chain((n) => ["properties", n]),
  filter(complement(isEmpty)),
  split("."),
);
export const getSchema = (name) => path(getSchemaPath(name), schema);
export const getValidationPath = compose(concat("#/"), replace(/\./g, "/"));
