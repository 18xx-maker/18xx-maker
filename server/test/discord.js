import { createServer } from "node:http";

// A fake Discord API. users: [{ code, id, username, avatar, guilds: [id],
// failGuilds?, hang? }]. The access token for a code is `at-<code>`. A user
// with hang gets no answer to the token request, ever. GET .../authorize is a
// page with a "Sign in as <username>" link per user (for a browser).
// Webhooks: POST /api/webhooks/:id/:token is recorded in `posts` and answered
// 204, or as setWebhook(token, { status, delayMs, headers }) says.
export const startFakeDiscord = async ({ users = [] } = {}) => {
  const posts = [];
  const webhooks = new Map();

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

    const hook = pathname.match(/^\/api\/webhooks\/(\d+)\/([\w-]+)$/);
    if (req.method === "POST" && hook) {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        const [, id, token] = hook;
        posts.push({ id, token, body: JSON.parse(body), at: Date.now() });
        const {
          status = 204,
          delayMs = 0,
          headers = {},
        } = webhooks.get(token) || {};
        setTimeout(() => {
          if (res.destroyed) return;
          res.writeHead(status, headers);
          res.end(status === 204 ? undefined : "{}");
        }, delayMs);
      });
      return;
    }

    // The consent page, for a real browser: a link per user back to the
    // redirect_uri with that user's code and the state
    if (req.method === "GET" && pathname.endsWith("/authorize")) {
      const params = new URL(req.url, "http://localhost").searchParams;
      let back;
      try {
        back = new URL(params.get("redirect_uri"));
      } catch {
        return json(res, 400, { error: "invalid_request" });
      }
      const links = users.map((u) => {
        back.searchParams.set("code", u.code);
        back.searchParams.set("state", params.get("state") ?? "");
        const href = back.href.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
        return `<li><a href="${href}">Sign in as ${u.username}</a></li>`;
      });
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(
        `<!doctype html><title>Fake Discord</title><ul>${links.join("")}</ul>`,
      );
      return;
    }

    if (req.method === "POST" && pathname === "/oauth2/token") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        const code = new URLSearchParams(body).get("code");
        const user = users.find((u) => u.code === code);
        if (!user) return json(res, 400, { error: "invalid_grant" });
        if (user.hang) return;
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
    posts,
    setWebhook: (token, behavior) => webhooks.set(token, behavior),
    close: () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  };
};
