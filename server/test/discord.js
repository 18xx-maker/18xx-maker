import { createServer } from "node:http";

// A fake Discord API. users: [{ code, id, username, avatar, guilds: [id],
// failGuilds? }]. The access token for a code is `at-<code>`.
export const startFakeDiscord = async ({ users }) => {
  const byToken = (req) => {
    const token = (req.headers.authorization || "").replace(/^Bearer /, "");
    return users.find((u) => `at-${u.code}` === token);
  };

  const json = (res, status, body) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };

  const server = createServer((req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");

    if (req.method === "POST" && pathname === "/oauth2/token") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        const code = new URLSearchParams(body).get("code");
        const user = users.find((u) => u.code === code);
        if (!user) return json(res, 400, { error: "invalid_grant" });
        json(res, 200, {
          access_token: `at-${user.code}`,
          token_type: "Bearer",
        });
      });
      return;
    }

    const user = byToken(req);
    if (!user) return json(res, 401, { message: "401: Unauthorized" });

    if (pathname === "/users/@me") {
      return json(res, 200, {
        id: user.id,
        username: user.username,
        avatar: user.avatar ?? null,
      });
    }
    if (pathname === "/users/@me/guilds") {
      if (user.failGuilds) return json(res, 500, { message: "boom" });
      return json(
        res,
        200,
        (user.guilds || []).map((id) => ({ id })),
      );
    }
    json(res, 404, {});
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  };
};
