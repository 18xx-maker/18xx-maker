import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { createApi } from "@/play/client/api";
import {
  clearNonce,
  newNonce,
  readNonce,
  storeNonce,
} from "@/play/client/loginNonce";
import { clearToken, getToken, setToken } from "@/play/client/tokenStore";
import { useLocation, useNavigate } from "@/router";
import { createAlert } from "@/state/alerts";
import { selectPlayServer } from "@/state/selectors";
import capability from "@/util/capability";

// The play server of the settings for a page: the api, the stored token and
// the signed in user. status is "electron" or "noServer" (nothing is
// requested), "signedout", "loading", "error" or "ready".
//
// The server sends the login back to <return>#token=<token>&nonce=<nonce>:
// the token is stored for the server url only when the nonce is the one this
// tab made when it began the login (once), and the fragment is replaced out of
// the address and the history. It is never logged or sent anywhere else.
// Without a server or in Electron the fragment is only replaced out, never
// stored. #error=<code>&nonce=<nonce> is a login Discord did not complete.
export const useApi = () => {
  const server = useSelector(selectPlayServer);
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [version, setVersion] = useState(0);
  const [session, setSession] = useState(null);
  const [failure, setFailure] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const blocked = capability.electron ? "electron" : server ? null : "noServer";
  const params = new URLSearchParams(hash.slice(1));
  const hasLogin = params.has("token") || params.has("error");
  const fragmentToken = params.get("token");
  const fragmentError = params.get("error");
  const fragmentNonce = params.get("nonce");
  // Read once per fragment: a later render must not see a cleared nonce
  const expected = useMemo(
    () => (hasLogin && !blocked ? readNonce() : null),
    [hasLogin, blocked],
  );
  const valid = Boolean(expected) && fragmentNonce === expected;
  const fragment = (valid && fragmentToken) || null;

  useEffect(() => {
    if (!hasLogin) return;
    if (!blocked) {
      clearNonce();
      if (fragment) {
        setToken(server, fragment);
        setVersion((v) => v + 1);
      } else {
        const cancelled = valid && fragmentError === "access_denied";
        dispatch(
          createAlert(
            t("alerts.error"),
            t(cancelled ? "play.signInCancelled" : "play.signInFailed"),
            "error",
          ),
        );
      }
    }
    navigate({ hash: "" }, { replace: true });
  }, [
    hasLogin,
    blocked,
    fragment,
    valid,
    fragmentError,
    server,
    navigate,
    dispatch,
    t,
  ]);

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
  }, [api, token, server, attempt]);

  const retry = useCallback(() => {
    setFailure(null);
    setAttempt((n) => n + 1);
  }, []);

  const user = session?.token === token ? session.user : null;
  const error = failure?.token === token ? failure.message : null;

  // The nonce of this page's sign in link, kept for the tab when it is used
  const nonce = useMemo(newNonce, []);
  const signInUrl = api
    ? api.loginUrl(`${window.location.origin}${pathname}`, nonce)
    : null;
  // The click handler of the link, before the browser goes to Discord
  const signIn = useCallback(() => storeNonce(nonce), [nonce]);

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
    retry,
  };
};

export default useApi;
