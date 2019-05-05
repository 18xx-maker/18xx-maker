import { resolveFont } from "./FontContext";

const fonts = {
  size: "size-01",
  weight: "weight-01",
  family: "family-01",
  foo: {
    size: "size-02",
    bar: {
      size: "size-03",
      weight: "weight-03",
      family: "family-03"
    }
  }
};

describe("resolveFont", () => {
  describe("with an empty context", () => {
    it("should return the default font", () => {
      expect(resolveFont([], fonts)).toEqual({
        fontSize: "size-01",
        fontWeight: "weight-01",
        fontFamily: "family-01",
        lineHeight: "size-01"
      });
    });
  });

  describe("with a single context", () => {
    it("should properly merge the fonts", () => {
      expect(resolveFont(["foo"], fonts)).toEqual({
        fontSize: "size-02",
        fontWeight: "weight-01",
        fontFamily: "family-01",
        lineHeight: "size-02"
      });
    });
  });

  describe("with a double context", () => {
    it("should properly merge the fonts", () => {
      expect(resolveFont(["foo", "bar"], fonts)).toEqual({
        fontSize: "size-03",
        fontWeight: "weight-03",
        fontFamily: "family-03",
        lineHeight: "size-03"
      });
    });
  });

  describe("with an unknown context", () => {
    it("should properly merge the fonts", () => {
      expect(resolveFont(["foo", "unknown", "bar"], fonts)).toEqual({
        fontSize: "size-03",
        fontWeight: "weight-03",
        fontFamily: "family-03",
        lineHeight: "size-03"
      });
    });

    it("should properly merge the fonts", () => {
      expect(resolveFont(["foo", "bar", "unknown", "bar"], fonts)).toEqual({
        fontSize: "size-03",
        fontWeight: "weight-03",
        fontFamily: "family-03",
        lineHeight: "size-03"
      });
    });
  });
});
