// REST client of the play server (see server/README.md). Plain functions over
// an injectable fetch; every failure is an ApiError (status 0 = no response).
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const readJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const createApi = ({ baseUrl, token, fetch = globalThis.fetch }) => {
  const base = baseUrl.replace(/\/+$/, "");
  const enc = encodeURIComponent;

  const send = async (method, path, { json, body, type } = {}) => {
    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (json !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(json);
    } else if (type) {
      headers["Content-Type"] = type;
    }

    let res;
    try {
      res = await fetch(`${base}${path}`, { method, headers, body });
    } catch (error) {
      throw new ApiError(0, error?.message || "Network error");
    }

    if (!res.ok) {
      const data = await readJson(res);
      throw new ApiError(
        res.status,
        data?.error || `HTTP ${res.status}`,
        data?.errors,
      );
    }
    return res;
  };

  const request = async (method, path, options) => {
    const res = await send(method, path, options);
    return res.status === 204 ? null : readJson(res);
  };

  return {
    loginUrl: (returnUrl, nonce) =>
      `${base}/auth/discord/login?return=${enc(returnUrl)}&nonce=${enc(nonce)}`,
    me: () => request("GET", "/me"),
    logout: () => request("POST", "/auth/logout"),
    listGames: () => request("GET", "/games"),
    createGame: ({ game, config, seatName }) =>
      request("POST", "/games", { json: { game, config, seatName } }),
    getGame: (id) => request("GET", `/games/${enc(id)}`),
    setStatus: (id, status) =>
      request("PATCH", `/games/${enc(id)}`, { json: { status } }),
    setWebhook: (id, url) =>
      request("PATCH", `/games/${enc(id)}`, { json: { webhookUrl: url } }),
    deleteGame: (id) => request("DELETE", `/games/${enc(id)}`),
    newInvite: (id) => request("POST", `/games/${enc(id)}/invite`),
    getInvite: (code) => request("GET", `/invites/${enc(code)}`),
    join: (code, { name, color }) =>
      request("POST", `/invites/${enc(code)}/join`, { json: { name, color } }),
    putAsset: (id, name, blob) =>
      request("PUT", `/games/${enc(id)}/assets/${enc(name)}`, {
        body: blob,
        type: blob.type || "application/octet-stream",
      }),
    getAsset: async (id, name) =>
      (await send("GET", `/games/${enc(id)}/assets/${enc(name)}`)).blob(),
    assetUrl: (id, name) => `${base}/games/${enc(id)}/assets/${enc(name)}`,
  };
};
