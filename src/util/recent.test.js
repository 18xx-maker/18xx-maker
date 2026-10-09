import "@tests/support/windowStub.js";

import { addRecent } from "@/util/recent";

const caps = vi.hoisted(() => ({ electron: true }));
const render = vi.hoisted(() => ({ input: null }));

vi.mock("@/util/capability", () => ({ default: caps }));
vi.mock("@/util/renderInput", () => ({ getRenderInput: () => render.input }));

const game = { info: { title: "T" }, meta: { slug: "electron:a" } };

beforeEach(() => {
  caps.electron = true;
  render.input = null;
  window.api = { addRecent: vi.fn() };
});

describe("addRecent", () => {
  it("adds the game to the recent files and passes it on", () => {
    expect(addRecent(game)).toBe(game);
    expect(window.api.addRecent).toHaveBeenCalledWith("T", "electron:a");
  });

  it("does nothing outside the app, in a capture window or without a game", () => {
    caps.electron = false;
    expect(addRecent(game)).toBe(game);
    caps.electron = true;
    render.input = { id: "x" };
    expect(addRecent(game)).toBe(game);
    render.input = null;
    expect(addRecent(undefined)).toBeUndefined();
    expect(window.api.addRecent).not.toHaveBeenCalled();
  });
});
