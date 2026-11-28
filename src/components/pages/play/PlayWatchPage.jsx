import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";

import PlayBoard from "@/components/play/PlayBoard";
import PlayNotice from "@/components/play/PlayNotice";

import usePlayGame from "@/hooks/usePlayGame";
import { Link, useParams } from "@/router";
import { selectPlayServer } from "@/state/selectors";
import capability from "@/util/capability";

const Back = () => {
  const { t } = useTranslation();
  return (
    <Button asChild variant="outline">
      <Link to="/play">{t("play.watch.back")}</Link>
    </Button>
  );
};

// Only rendered with a server. A spectator link needs no sign in: the game
// and the socket go by the code alone, never with the token.
const Watch = ({ server, code }) => {
  const { t } = useTranslation();
  const game = usePlayGame({ baseUrl: server, watch: code });

  if (game.status === "loading") return <p>{t("play.loading")}</p>;
  if (game.status === "error" || game.status === "denied") {
    let text = t("play.error", { message: game.error });
    if (game.missing) text = t("play.watch.missing");
    else if (game.error === "too_many_spectators") text = t("play.watch.full");
    else if (game.status === "denied") text = t("play.watch.stopped");
    return (
      <div className="flex flex-col items-start gap-3" role="alert">
        <p>{text}</p>
        <Back />
      </div>
    );
  }
  return <PlayBoard play={game} />;
};

const PlayWatchPage = () => {
  const { code } = useParams();
  const server = useSelector(selectPlayServer);
  const blocked = capability.electron ? "electron" : server ? null : "noServer";

  return (
    <div className="p-4" data-testid="play-watch">
      {blocked ? (
        <PlayNotice status={blocked} />
      ) : (
        <Watch server={server} code={code} />
      )}
    </div>
  );
};

export default PlayWatchPage;
