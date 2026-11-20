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

  it("closes the session on unmount", async () => {
    const { deps, session } = setup();
    const { result, unmount } = renderHook(() => usePlayGame(options, deps));
    await waitFor(() => expect(result.current.status).toBe("online"));
    unmount();
    expect(session.close).toHaveBeenCalledTimes(1);
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
});
