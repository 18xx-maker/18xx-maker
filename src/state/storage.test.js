// @vitest-environment happy-dom

import storage from "@/state/storage";

describe("storage", () => {
  describe("init", () => {
    it("should init", () => {
      storage.init("test");
      const keys = storage.getKeys();

      expect(keys).toEqual(["test"]);
      expect(keys).toBe(storage.getKeys());
    });

    it("should create a new key set", () => {
      storage.init("test");
      const keys = storage.getKeys();

      storage.init("test");

      expect(keys).toEqual(storage.getKeys());
      expect(keys).not.toBe(storage.getKeys());
    });
  });

  describe("initialState", () => {
    it("should return an empty object", () => {
      expect(storage.initialState()).toEqual({});
    });

    it("should return an empty object when local storage is empty", () => {
      storage.init("test");
      expect(storage.initialState()).toEqual({});
    });

    it("should return a value when local storage is used", () => {
      const value = { a: 1 };
      window.localStorage.setItem("test", JSON.stringify(value));
      storage.init("test");
      expect(storage.initialState()).toEqual({ test: value });
    });
  });
});
