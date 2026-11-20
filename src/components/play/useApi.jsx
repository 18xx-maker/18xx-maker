import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { createApi } from "@/play/client/api";
import { clearToken, getToken, setToken } from "@/play/client/tokenStore";
import { useLocation, useNavigate } from "@/router";
import { selectPlayServer } from "@/state/selectors";
import capability from "@/util/capability";

// The play server of the settings for a page: the api, the stored token and
// the signed in user. status is "electron" or "noServer" (nothing is
// requested), "signedout", "loading", "error" or "ready".
//
// The server sends the login back to <return>#token=<token>: the token is
// stored for the server url and the fragment is replaced out of the address
// and the history. It is never logged or sent anywhere else.
export const useApi = () => {
  const server = useSelector(selectPlayServer);
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [session, setSession] = useState(null);
  const [failure, setFailure] = useState(null);

  const blocked = capability.electron ? "electron" : server ? null : "noServer";
  const fragment = (!blocked && /^#token=(.+)$/.exec(hash)?.[1]) || null;

  useEffect(() => {
    if (!fragment) return;
    setToken(server, fragment);
    setVersion((v) => v + 1);
    navigate({ hash: "" }, { replace: true });
  }, [fragment, server, navigate]);

  const stored = useMemo(
    () => (blocked ? null : getToken(server)),
    // version: the token store changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blocked, server, version],
  );
  const token = fragment || stored;

  const api = useMemo(
    () => (blocked ? null : createApi({ baseUrl: server, token })),
    [blocked, server, token],
  );

  useEffect(() => {
    if (!api || !token) return;
    let live = true;
    api
      .me()
      .then((user) => live && setSession({ token, user }))
      .catch((error) => {
        if (!live) return;
        if (error.status === 401) {
          clearToken(server);
          setVersion((v) => v + 1);
        } else {
          setFailure({ token, message: error.message });
        }
      });
    return () => {
      live = false;
    };
  }, [api, token, server]);

  const user = session?.token === token ? session.user : null;
  const error = failure?.token === token ? failure.message : null;

  const signInUrl = api
    ? api.loginUrl(`${window.location.origin}${pathname}`)
    : null;
  const signIn = useCallback(
    () => window.location.assign(signInUrl),
    [signInUrl],
  );

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // The token is dropped here either way
    }
    clearToken(server);
    setVersion((v) => v + 1);
  }, [api, server]);

  let status = blocked;
  if (!status) {
    if (!token) status = "signedout";
    else if (error) status = "error";
    else status = user ? "ready" : "loading";
  }

  return {
    status,
    server,
    api,
    token,
    user,
    error,
    signInUrl,
    signIn,
    signOut,
  };
};

export default useApi;
