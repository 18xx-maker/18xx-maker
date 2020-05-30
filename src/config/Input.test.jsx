import { getSchemaPath } from "./Input.jsx";

describe("getSchemaPath", () => {
  describe("with an empty argument", () => {
    it("should return []", () => {
      expect(getSchemaPath("")).toEqual([]);
    });
  });

  describe("with a single argument", () => {
    it("should return a single answer", () => {
      expect(getSchemaPath("foo")).toEqual(['properties', 'foo']);
    });
  });

  describe("with a double argument", () => {
    it("should return a double answer", () => {
      expect(getSchemaPath("foo.bar")).toEqual(['properties', 'foo',
                                                'properties', 'bar']);
    });
  });
});
