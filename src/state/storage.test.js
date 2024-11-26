// @vitest-environment jsdom

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
    afterEach(() => {
      vi.restoreAllMocks();
    });

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

    it("should log an error if local storage throws", () => {
      // Mock local storage to throw an error
      const localStorage = { getItem: vi.fn(window.localStorage.getItem) };
      localStorage.getItem.mockImplementation(() => {
        throw new Error("test");
      });
      vi.stubGlobal("localStorage", localStorage);

      // Mock console
      const error = vi.fn(() => {});
      vi.stubGlobal("console", { error });

      storage.init("test");
      expect(storage.initialState()).toEqual({});
      expect(localStorage.getItem).toHaveBeenCalledOnce();
      expect(error).toHaveBeenCalledOnce();
    });
  });

  describe("listen", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should subscribe to a store", () => {
      // List for these keys
      storage.init("foo", "bar");

      // Mock a redux store
      const subscribe = vi.fn(() => {});
      const getState = vi.fn(() => {});
      const store = { subscribe, getState };
      const state1 = { foo: "1", bar: "2", baz: "3" };
      const state2 = { foo: "2", baz: "3" };

      const localStorage = {
        removeItem: vi.fn(() => {}),
        setItem: vi.fn(() => {}),
      };
      vi.stubGlobal("localStorage", localStorage);

      // Listen to the store
      storage.listen(store);
      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(getState).toHaveBeenCalledTimes(0);

      // Grab the callback and call it
      const callback = subscribe.mock.calls[0][0];
      getState.mockReturnValueOnce(state1);
      callback();

      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(getState).toHaveBeenCalledTimes(1);

      getState.mockReturnValueOnce(state2);
      callback();

      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(getState).toHaveBeenCalledTimes(2);

      // Check that we removed and added the right items
      expect(localStorage.removeItem).toHaveBeenLastCalledWith("bar");
      expect(localStorage.setItem).toHaveBeenLastCalledWith("foo", '"2"');
    });
  });
});
