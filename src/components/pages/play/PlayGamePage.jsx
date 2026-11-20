import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import PlayNotice from "@/components/play/PlayNotice";
import useApi from "@/components/play/useApi";

import usePlayGame from "@/hooks/usePlayGame";
import { Link, useParams } from "@/router";

const Back = () => {
  const { t } = useTranslation();
  return (
    <Button asChild variant="outline">
      <Link to="/play">{t("play.game.back")}</Link>
    </Button>
  );
};

// Only rendered with a server, a token and the signed in user: the hook
// cannot be called without them
const PlayGame = ({ id, play }) => {
  const { t } = useTranslation();
  const game = usePlayGame({
    baseUrl: play.server,
    token: play.token,
    gameId: id,
    userId: play.user.id,
  });

  if (game.status === "denied") {
    return (
      <PlayNotice status="signedout" signInUrl={play.signInUrl}>
        <p>{t("play.game.denied")}</p>
      </PlayNotice>
    );
  }
  if (game.status === "error") {
    return (
      <div className="flex flex-col items-start gap-3" role="alert">
        <p>
          {game.locked
            ? t("play.game.locked")
            : t("play.error", { message: game.error })}
        </p>
        <Back />
      </div>
    );
  }
  if (game.status === "loading") return <p>{t("play.loading")}</p>;
  // Replaced by the board
  return <div />;
};

const PlayGamePage = () => {
  const { id } = useParams();
  const play = useApi();

  return (
    <div className="p-4" data-testid="play-game">
      {play.status === "ready" ? (
        <PlayGame id={id} play={play} />
      ) : (
        <PlayNotice {...play} />
      )}
    </div>
  );
};

export default PlayGamePage;
