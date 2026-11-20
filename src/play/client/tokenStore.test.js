import { clearToken, getToken, setToken } from "@/play/client/tokenStore";

import { resetWindow } from "@tests/support/windowStub.js";

beforeEach(() => resetWindow());
afterEach(() => vi.restoreAllMocks());

describe("play token store", () => {
  it("is null without a token", () => {
    expect(getToken("https://a.test")).toBeNull();
  });

  it("sets, gets and clears a token per server url", () => {
    setToken("https://a.test", "one");
    setToken("https://b.test", "two");
    expect(getToken("https://a.test")).toBe("one");
    expect(getToken("https://b.test")).toBe("two");

    clearToken("https://a.test");
    expect(getToken("https://a.test")).toBeNull();
    expect(getToken("https://b.test")).toBe("two");
    expect(JSON.parse(window.localStorage.getItem("play-tokens"))).toEqual({
      "https://b.test": "two",
    });
  });

  it("survives a corrupt stored value", () => {
    window.localStorage.setItem("play-tokens", "{nope");
    expect(getToken("https://a.test")).toBeNull();
    setToken("https://a.test", "one");
    expect(getToken("https://a.test")).toBe("one");
  });

  it("never throws when local storage does", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getToken("https://a.test")).toBeNull();
    expect(() => setToken("https://a.test", "one")).not.toThrow();
    expect(() => clearToken("https://a.test")).not.toThrow();
  });
});
