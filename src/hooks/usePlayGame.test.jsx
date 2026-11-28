import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePlayGame } from "@/hooks/usePlayGame";

const options = { baseUrl: "http://x", token: "t", gameId: "g1", userId: 7 };
const record = {
  id: "g1",
  status: "active",
  game: { info: { title: "T" } },
  config: { a: 1 },
  seats: [{ userId: 7, name: "Me" }],
};

const setup = (view = {}, { game = record } = {}) => {
  let listener;
  const session = {
    subscribe: vi.fn((fn) => {
      listener = fn;
      fn({ status: "online", log: [], seats: record.seats, presence: [] });
      return vi.fn();
    }),
    send: vi.fn(),
    clearError: vi.fn(),
    close: vi.fn(),
  };
  const deps = {
    api: { getGame: vi.fn(() => Promise.resolve(game)) },
    createSession: vi.fn(() => session),
  };
  return {
    session,
    deps,
    push: (v) =>
      act(() => listener({ seats: [], presence: [], ...view, ...v })),
  };
};

const ev = (seq, event) => ({ seq, userId: 7, ...event });

describe("usePlayGame", () => {
  it("is loading, then online with the game", async () => {
    const { deps, session } = setup();
    const { result } = renderHook(() => usePlayGame(options, deps));
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("online"));
    expect(result.current.game).toBe(record.game);
    expect(result.current.config).toBe(record.config);
    expect(result.current.me).toEqual(record.seats[0]);
    expect(deps.api.getGame).toHaveBeenCalledWith("g1");
    expect(deps.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ gameId: "g1", userId: 7, token: "t" }),
    );
    expect(session.close).not.toHaveBeenCalled();
  });

  it("sends events and undoes the newest effective one", async () => {
    const { deps, session, push } = setup();
    const { result } = renderHook(() => usePlayGame(options, deps));
    await waitFor(() => expect(result.current.status).toBe("online"));
    act(() => result.current.undo());
    expect(session.send).not.toHaveBeenCalled();
    push({
      status: "online",
      log: [
        ev(1, { type: "note.set", text: "a" }),
        ev(2, { type: "note.set", text: "b" }),
      ],
    });
    act(() => result.current.undo());
    expect(session.send).toHaveBeenCalledWith({ type: "undo", target: 2 });
    act(() => result.current.send({ type: "note.set", text: "b" }));
    expect(session.send).toHaveBeenLastCalledWith({
      type: "note.set",
      text: "b",
    });
  });

  it("does not send when locked", async () => {
    const { deps, session, push } = setup();
    const { result } = renderHook(() => usePlayGame(options, deps));
    await waitFor(() => expect(result.current.status).toBe("online"));
    push({ status: "locked", log: [ev(1, { type: "note.set", text: "a" })] });
    expect(result.current.locked).toBe(true);
    act(() => result.current.send({ type: "note.set", text: "b" }));
    act(() => result.current.undo());
    expect(session.send).not.toHaveBeenCalled();
  });

  it("gives the error of a rejected move and dismisses it", async () => {
    const { deps, session, push } = setup();
    const { result } = renderHook(() => usePlayGame(options, deps));
    await waitFor(() => expect(result.current.status).toBe("online"));
    push({ status: "online", log: [], error: "bad undo" });
    expect(result.current.error).toBe("bad undo");
    act(() => result.current.dismissError());
    expect(session.clearError).toHaveBeenCalledTimes(1);
  });

  it("closes the session on unmount", async () => {
    const { deps, session } = setup();
    const { result, unmount } = renderHook(() => usePlayGame(options, deps));
    await waitFor(() => expect(result.current.status).toBe("online"));
    unmount();
    expect(session.close).toHaveBeenCalledTimes(1);
  });

  it("exposes the owner and invite code, and follows a status change", async () => {
    const { deps } = setup(
      {},
      { game: { ...record, ownerId: 7, inviteCode: "abc" } },
    );
    const { result } = renderHook(() => usePlayGame(options, deps));
    await waitFor(() => expect(result.current.status).toBe("online"));
    expect(result.current.ownerId).toBe(7);
    expect(result.current.inviteCode).toBe("abc");
    expect(result.current.locked).toBe(false);
    act(() => result.current.setStatus("locked"));
    expect(result.current.gameStatus).toBe("locked");
    expect(result.current.locked).toBe(true);
    act(() => result.current.setStatus("active"));
    expect(result.current.locked).toBe(false);
  });

  it("opens a fresh session when the owner unlocks a latched game", async () => {
    const { deps, session, push } = setup(
      {},
      { game: { ...record, ownerId: 7, status: "locked" } },
    );
    const { result } = renderHook(() => usePlayGame(options, deps));
    await waitFor(() => expect(result.current.status).toBe("online"));
    push({ status: "locked", log: [] });
    expect(result.current.locked).toBe(true);
    expect(deps.createSession).toHaveBeenCalledTimes(1);
    act(() => result.current.setStatus("active"));
    expect(deps.createSession).toHaveBeenCalledTimes(2);
    expect(session.close).toHaveBeenCalledTimes(1);
    expect(result.current.locked).toBe(false);
    act(() => result.current.send({ type: "note.set", text: "a" }));
    expect(session.send).toHaveBeenCalledTimes(1);
    act(() => result.current.setStatus("locked"));
    act(() => result.current.send({ type: "note.set", text: "b" }));
    expect(session.send).toHaveBeenCalledTimes(1);
  });

  it.each([
    [401, "denied", false],
    [410, "error", true],
    [0, "error", false],
  ])("reports a failed load (%s)", async (code, status, locked) => {
    const { deps } = setup();
    deps.api.getGame = vi.fn(() =>
      Promise.reject(Object.assign(new Error("no"), { status: code })),
    );
    const { result } = renderHook(() => usePlayGame(options, deps));
    await waitFor(() => expect(result.current.status).toBe(status));
    expect(result.current.locked).toBe(locked);
    expect(result.current.error).toBe("no");
    expect(deps.createSession).not.toHaveBeenCalled();
  });

  describe("assets", () => {
    const SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="7" height="3"/></svg>';
    const blob = () => new Blob([SVG], { type: "image/svg+xml" });

    it("loads the listed images after the game, through getAsset", async () => {
      const { deps } = setup(
        {},
        { game: { ...record, assets: ["icons.star"] } },
      );
      deps.api.getAsset = vi.fn(async () => blob());
      const { result } = renderHook(() => usePlayGame(options, deps));
      await waitFor(() => expect(result.current.game).toBe(record.game));
      await waitFor(() => expect(result.current.assets?.icons.star).toBe(SVG));
      expect(deps.api.getAsset).toHaveBeenCalledWith("g1", "icons.star");
    });

    it("has no images for a game with none", async () => {
      const { deps } = setup();
      deps.api.getAsset = vi.fn();
      const { result } = renderHook(() => usePlayGame(options, deps));
      await waitFor(() => expect(result.current.status).toBe("online"));
      expect(result.current.assets).toBeUndefined();
      expect(deps.api.getAsset).not.toHaveBeenCalled();
    });

    it("drops the images of a game it no longer shows", async () => {
      const first = { ...record, assets: ["icons.star"] };
      const second = { ...record, id: "g2", assets: ["icons.moon"] };
      const answers = {};
      const { deps } = setup();
      deps.api.getGame = vi.fn(async (id) => (id === "g1" ? first : second));
      deps.api.getAsset = vi.fn(
        (id, name) =>
          new Promise((resolve) => {
            answers[`${id}/${name}`] = () => resolve(blob());
          }),
      );
      const { result, rerender } = renderHook(
        ({ gameId }) => usePlayGame({ ...options, gameId }, deps),
        { initialProps: { gameId: "g1" } },
      );
      await waitFor(() => expect(answers["g1/icons.star"]).toBeDefined());
      rerender({ gameId: "g2" });
      await waitFor(() => expect(answers["g2/icons.moon"]).toBeDefined());
      // The first game's answer comes late: it is dropped
      await act(async () => {
        answers["g1/icons.star"]();
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      expect(result.current.assets).toBeUndefined();
      await act(async () => answers["g2/icons.moon"]());
      await waitFor(() =>
        expect(result.current.assets?.icons).toEqual({ moon: SVG }),
      );
    });

    it("never requests the old game's images for a new game", async () => {
      const first = { ...record, assets: ["icons.star"] };
      const second = { ...record, id: "g2", assets: ["icons.moon"] };
      const { deps } = setup();
      let answerSecond;
      deps.api.getGame = vi.fn((id) =>
        id === "g1"
          ? Promise.resolve(first)
          : new Promise((resolve) => {
              answerSecond = () => resolve(second);
            }),
      );
      deps.api.getAsset = vi.fn(async () => blob());
      const { result, rerender } = renderHook(
        ({ gameId }) => usePlayGame({ ...options, gameId }, deps),
        { initialProps: { gameId: "g1" } },
      );
      await waitFor(() => expect(result.current.assets).toBeDefined());
      rerender({ gameId: "g2" });
      await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
      expect(deps.api.getAsset).not.toHaveBeenCalledWith("g2", "icons.star");
      expect(result.current.assets).toBeUndefined();
      await act(async () => answerSecond());
      await waitFor(() =>
        expect(result.current.assets?.icons).toEqual({ moon: SVG }),
      );
      expect(deps.api.getAsset.mock.calls).toEqual([
        ["g1", "icons.star"],
        ["g2", "icons.moon"],
      ]);
    });

    it("stops requesting images once unmounted", async () => {
      const names = Array.from({ length: 20 }, (_, i) => `icons.i${i}`);
      const { deps } = setup({}, { game: { ...record, assets: names } });
      const answers = [];
      deps.api.getAsset = vi.fn(
        () => new Promise((resolve) => answers.push(() => resolve(blob()))),
      );
      const { unmount } = renderHook(() => usePlayGame(options, deps));
      await waitFor(() => expect(answers).toHaveLength(4));
      unmount();
      await act(async () => {
        answers.forEach((answer) => answer());
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      expect(deps.api.getAsset).toHaveBeenCalledTimes(4);
    });
  });
});
