import "@tests/support/windowStub.js";

import { compileSchema, draft07 } from "json-schema-library";

import { ELEMENT_KEYS, NEW_ELEMENT } from "@/components/hexEditor/hexModel";
import {
  FORM_KINDS,
  HEX_PROPERTIES,
  JSON_ONLY,
  RAW_JSON,
  elementSchema,
} from "@/components/hexEditor/hexSchema";
import { INSPECTORS } from "@/components/hexEditor/inspectors";

import en from "@/locales/en.json";
import tilesDefs from "@/schemas/tiles.defs.json";

const hexSchema = compileSchema(
  { definitions: tilesDefs.definitions, $ref: "#/definitions/hex" },
  { drafts: [draft07] },
);

// Every property of a hex has a place in the editor, so one added to the
// schema later does not go missing from the form without anybody deciding it
describe("the hex schema and the form", () => {
  it("gives every property of a hex a form kind or puts it in the raw JSON", () => {
    const missing = Object.keys(HEX_PROPERTIES).filter(
      (key) => !FORM_KINDS[key] && !RAW_JSON.includes(key),
    );
    expect(missing).toEqual([]);
  });

  it("only names properties the schema has", () => {
    for (const key of [...Object.keys(FORM_KINDS), ...RAW_JSON]) {
      expect(HEX_PROPERTIES).toHaveProperty(key);
    }
    expect(RAW_JSON.filter((key) => FORM_KINDS[key])).toEqual([]);
  });

  it("has a list of elements for each kind that is elements", () => {
    const kinds = Object.keys(FORM_KINDS).filter(
      (key) => FORM_KINDS[key] === "elements",
    );
    expect(kinds.sort()).toEqual([...ELEMENT_KEYS].sort());
    const withFields = kinds.filter((key) => !JSON_ONLY.includes(key));
    for (const key of withFields) {
      expect(elementSchema(key).properties).toBeTruthy();
    }
    for (const key of kinds) {
      expect(en.hexEditor.form.elements[key]).toBeTruthy();
    }
  });

  it("has an inspector of its own for every element but the tokens", () => {
    const missing = ELEMENT_KEYS.filter(
      (key) => !JSON_ONLY.includes(key) && !INSPECTORS[key],
    );
    expect(missing).toEqual([]);
  });

  it("can add every element that has fields", () => {
    const missing = ELEMENT_KEYS.filter(
      (key) => !JSON_ONLY.includes(key) && !NEW_ELEMENT[key],
    );
    expect(missing).toEqual([]);
  });

  it("has inspectors only for elements", () => {
    for (const key of Object.keys(INSPECTORS)) {
      expect(ELEMENT_KEYS).toContain(key);
    }
  });

  it("starts the elements it adds with a valid element", () => {
    for (const [key, element] of Object.entries(NEW_ELEMENT)) {
      const hex = { color: "plain", hexes: ["A1"] };
      hex[key] = key === "offBoardRevenue" ? element : [element];
      expect(hexSchema.validate(hex).errors).toEqual([]);
    }
  });
});
