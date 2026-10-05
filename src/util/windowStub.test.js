import "@tests/support/windowStub.js";

describe("window stub", () => {
  it("lets tests spy on Storage.prototype.setItem", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    window.localStorage.setItem("k", "v");

    expect(setItem).toHaveBeenCalledWith("k", "v");
    expect(window.localStorage.getItem("k")).toBe("v");
    setItem.mockRestore();
    window.localStorage.clear();
  });
});
