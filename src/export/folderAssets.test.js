import { createFolderAssets } from "../../electron/main/assets.js";

describe("createFolderAssets", () => {
  const setup = (warnings = []) => {
    const assets = { icons: { a: "<svg/>" }, logos: {}, trains: {} };
    const load = vi.fn(() => ({ assets, warnings }));
    const log = vi.fn();
    const folder = createFolderAssets({
      summaryOf: (id) => (id === "abc" ? { path: "/games/g.json" } : undefined),
      load,
      log,
    });
    return { folder, load, log, assets };
  };

  it("reads the folder of the path in the summary", () => {
    const { folder, load, assets } = setup();
    expect(folder.of("abc")).toBe(assets);
    expect(load).toHaveBeenCalledWith("/games/g.json");
  });

  it("gives no images for a game that is not known, without reading", () => {
    const { folder, load } = setup();
    for (const id of ["nope", undefined, 5, "../abc", {}]) {
      expect(folder.of(id)).toEqual({ icons: {}, logos: {}, trains: {} });
    }
    expect(load).not.toHaveBeenCalled();
  });

  it("reports the files that were skipped", () => {
    const { folder, log } = setup(["/games/g.assets/icons/x.svg: too big"]);
    folder.of("abc");
    expect(log).toHaveBeenCalledWith(
      "Assets: /games/g.assets/icons/x.svg: too big",
    );
  });

  it("answers the channel with the images of the id the page names", () => {
    const { folder, assets } = setup();
    expect(folder.handler({}, "abc")).toBe(assets);
  });

  it("reads the folder for an export of an electron game, by the id of the request", () => {
    const { folder, load, assets } = setup();
    const game = { meta: { type: "electron" } };
    expect(folder.ofRequest({ id: "abc", game })).toBe(assets);
    expect(load).toHaveBeenCalledWith("/games/g.json");
    // A page can not make main read the folder of another game by its type
    expect(folder.ofRequest({ id: "nope", game })).toEqual({
      icons: {},
      logos: {},
      trains: {},
    });
  });

  it("leaves any other game to the request", () => {
    const { folder, load } = setup();
    for (const game of [
      { meta: { type: "internal" } },
      { meta: {} },
      {},
      undefined,
    ]) {
      expect(folder.ofRequest({ id: "abc", game })).toBeUndefined();
    }
    expect(folder.ofRequest(undefined)).toBeUndefined();
    expect(load).not.toHaveBeenCalled();
  });
});
