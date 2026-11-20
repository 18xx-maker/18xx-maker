import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import { Link } from "@/router";

// What a play page shows instead of its content: no server, the desktop app,
// signed out, still loading or a server that does not answer. children go
// before the sign in link.
const PlayNotice = ({ status, signInUrl, error, children }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start gap-3 max-w-xl" role="status">
      {children}
      {status === "electron" && <p>{t("play.electron")}</p>}
      {status === "noServer" && (
        <>
          <p>{t("play.noServer")}</p>
          <Button asChild variant="outline">
            <Link to="/settings">{t("play.settings")}</Link>
          </Button>
        </>
      )}
      {status === "signedout" && (
        <>
          <p>{t("play.signInPrompt")}</p>
          <Button asChild>
            <a href={signInUrl}>{t("play.signIn")}</a>
          </Button>
        </>
      )}
      {status === "loading" && <p>{t("play.loading")}</p>}
      {status === "error" && (
        <p role="alert">{t("play.error", { message: error })}</p>
      )}
    </div>
  );
};

export default PlayNotice;
