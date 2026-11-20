import { ApiError, createApi } from "@/play/client/api";

const respond = (status, body, headers = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

const setup = (response = respond(200, {}), options = {}) => {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    if (response instanceof Error) throw response;
    return response.clone();
  };
  const api = createApi({
    baseUrl: "https://s.test",
    token: "tok",
    fetch,
    ...options,
  });
  return { api, calls };
};

describe("play rest client", () => {
  it("builds the login url and normalizes the base url", () => {
    const { api } = setup(undefined, { baseUrl: "https://s.test/" });
    expect(api.loginUrl("https://s/play", "nonce-1234567890ab")).toBe(
      "https://s.test/auth/discord/login?return=https%3A%2F%2Fs%2Fplay&nonce=nonce-1234567890ab",
    );
    expect(api.assetUrl("g1", "a b.png")).toBe(
      "https://s.test/games/g1/assets/a%20b.png",
    );
  });

  it("sends the bearer token and Accept header", async () => {
    const { api, calls } = setup(respond(200, { id: "u" }));
    expect(await api.me()).toEqual({ id: "u" });
    expect(calls[0].url).toBe("https://s.test/me");
    expect(calls[0].init.method).toBe("GET");
    expect(calls[0].init.headers.Authorization).toBe("Bearer tok");
    expect(calls[0].init.headers.Accept).toBe("application/json");
  });

  it("omits Authorization without a token", async () => {
    const { api, calls } = setup(respond(200, []), { token: null });
    await api.listGames();
    expect(calls[0].init.headers.Authorization).toBeUndefined();
  });

  it("calls each endpoint with its method, url and body", async () => {
    const { api, calls } = setup(respond(200, {}));
    await api.logout();
    await api.listGames();
    await api.createGame({ game: { a: 1 }, config: { b: 2 }, seatName: "Me" });
    await api.getGame("g1");
    await api.setStatus("g1", "locked");
    await api.setWebhook("g1", "https://discord.com/api/webhooks/1/a");
    await api.setWebhook("g1", null);
    await api.newInvite("g1");
    await api.getInvite("c/1");
    await api.join("c1", { name: "N", color: "#fff" });
    const seen = calls.map((c) => [c.init.method, c.url, c.init.body]);
    expect(seen).toEqual([
      ["POST", "https://s.test/auth/logout", undefined],
      ["GET", "https://s.test/games", undefined],
      [
        "POST",
        "https://s.test/games",
        JSON.stringify({ game: { a: 1 }, config: { b: 2 }, seatName: "Me" }),
      ],
      ["GET", "https://s.test/games/g1", undefined],
      [
        "PATCH",
        "https://s.test/games/g1",
        JSON.stringify({ status: "locked" }),
      ],
      [
        "PATCH",
        "https://s.test/games/g1",
        JSON.stringify({ webhookUrl: "https://discord.com/api/webhooks/1/a" }),
      ],
      [
        "PATCH",
        "https://s.test/games/g1",
        JSON.stringify({ webhookUrl: null }),
      ],
      ["POST", "https://s.test/games/g1/invite", undefined],
      ["GET", "https://s.test/invites/c%2F1", undefined],
      [
        "POST",
        "https://s.test/invites/c1/join",
        JSON.stringify({ name: "N", color: "#fff" }),
      ],
    ]);
    expect(calls[2].init.headers["Content-Type"]).toBe("application/json");
    expect(calls[1].init.headers["Content-Type"]).toBeUndefined();
  });

  it("deletes a game (204, no body)", async () => {
    const { api, calls } = setup(new Response(null, { status: 204 }));
    expect(await api.deleteGame("g1")).toBeNull();
    expect(calls[0].init.method).toBe("DELETE");
    expect(calls[0].url).toBe("https://s.test/games/g1");
  });

  it("puts an asset with its own content type", async () => {
    const { api, calls } = setup(new Response(null, { status: 204 }));
    const blob = new Blob(["x"], { type: "image/png" });
    await api.putAsset("g1", "a.png", blob);
    expect(calls[0].init.method).toBe("PUT");
    expect(calls[0].url).toBe("https://s.test/games/g1/assets/a.png");
    expect(calls[0].init.body).toBe(blob);
    expect(calls[0].init.headers["Content-Type"]).toBe("image/png");
    expect(calls[0].init.headers.Authorization).toBe("Bearer tok");
  });

  it("gets an asset as a blob with the bearer header", async () => {
    const { api, calls } = setup(
      new Response("abc", { headers: { "Content-Type": "image/png" } }),
    );
    const blob = await api.getAsset("g1", "a.png");
    expect(await blob.text()).toBe("abc");
    expect(calls[0].init.headers.Authorization).toBe("Bearer tok");
  });

  it("maps error responses to ApiError", async () => {
    let r = setup(respond(401, { error: "Unauthorized" }));
    await expect(r.api.me()).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Unauthorized",
    });

    r = setup(respond(410, { error: "Game is not open" }));
    const err = await r.api.join("c", { name: "n" }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(410);
    expect(err.message).toBe("Game is not open");

    r = setup(respond(422, { errors: [{ message: "bad" }] }));
    const e422 = await r.api.createGame({ game: {} }).catch((e) => e);
    expect(e422.status).toBe(422);
    expect(e422.errors).toEqual([{ message: "bad" }]);
    expect(e422.message).toBe("HTTP 422");
  });

  it("maps an asset error and a non-json error body", async () => {
    const r = setup(new Response("oops", { status: 500 }));
    await expect(r.api.getAsset("g", "a")).rejects.toMatchObject({
      status: 500,
    });
    await expect(r.api.me()).rejects.toMatchObject({ status: 500 });
  });

  it("creates, rotates and stops the spectator link with the token", async () => {
    const { api, calls } = setup(respond(200, { watchCode: "w1" }));
    expect(await api.newWatch("g/1")).toEqual({ watchCode: "w1" });
    await api.deleteWatch("g1");
    expect(calls.map((c) => [c.init.method, c.url])).toEqual([
      ["POST", "https://s.test/games/g%2F1/watch"],
      ["DELETE", "https://s.test/games/g1/watch"],
    ]);
    expect(calls[0].init.headers.Authorization).toBe("Bearer tok");
  });

  it("watches a game with no Authorization, even with a token", async () => {
    const { api, calls } = setup(respond(200, { gameId: "g1", title: "T" }));
    expect(await api.watchInfo("w/1")).toEqual({ gameId: "g1", title: "T" });
    await api.watchGame("w1");
    const blob = await api.watchAsset("w1", "a b.png");
    expect(blob).toBeInstanceOf(Blob);
    expect(calls.map((c) => [c.init.method, c.url])).toEqual([
      ["GET", "https://s.test/watch/w%2F1"],
      ["GET", "https://s.test/watch/w1/game"],
      ["GET", "https://s.test/watch/w1/assets/a%20b.png"],
    ]);
    for (const call of calls)
      expect(call.init.headers.Authorization).toBeUndefined();
  });

  it("maps an unknown watch code to a 404 ApiError", async () => {
    const { api } = setup(respond(404, { error: "Not found" }));
    await expect(api.watchGame("nope")).rejects.toMatchObject({
      status: 404,
      message: "Not found",
    });
  });

  it("maps a network failure to status 0", async () => {
    const { api } = setup(new TypeError("Failed to fetch"));
    const err = await api.me().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
    expect(err.message).toBe("Failed to fetch");
  });
});
