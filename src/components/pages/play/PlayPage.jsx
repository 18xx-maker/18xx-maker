import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import CreateGame from "@/components/play/CreateGame";
import PlayList from "@/components/play/PlayList";
import PlayNotice from "@/components/play/PlayNotice";
import useApi from "@/components/play/useApi";

const PlayPage = () => {
  const { t } = useTranslation();
  const play = useApi();

  return (
    <div className="p-4 flex flex-col gap-6" data-testid="play">
      <h1 className="text-4xl font-extrabold">{t("play.title")}</h1>
      {play.status === "ready" ? (
        <>
          <div className="flex items-center gap-3">
            <span>{t("play.signedInAs", { name: play.user.name })}</span>
            <Button size="sm" variant="outline" onClick={play.signOut}>
              {t("play.signOut")}
            </Button>
          </div>
          <CreateGame api={play.api} user={play.user} />
          <PlayList api={play.api} />
        </>
      ) : (
        <PlayNotice {...play} />
      )}
    </div>
  );
};

export default PlayPage;
