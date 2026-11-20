import { useTranslation } from "react-i18next";

import PlayBoard from "@/components/play/PlayBoard";
import PlayNotice, { BackLink } from "@/components/play/PlayNotice";
import useApi from "@/components/play/useApi";

import usePlayGame from "@/hooks/usePlayGame";
import { useParams } from "@/router";

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
      <PlayNotice status="signedout" signInProps={play.signInProps}>
        <p>{t("play.game.denied")}</p>
      </PlayNotice>
    );
  }
  if (game.status === "error") {
    return (
      <div className="flex flex-col items-start gap-3" role="alert">
        <p>
          {game.missing
            ? t("play.game.missing")
            : game.locked
              ? t("play.game.locked")
              : t("play.error", { message: game.error })}
        </p>
        <BackLink />
      </div>
    );
  }
  if (game.status === "loading") return <p>{t("play.loading")}</p>;
  const owner =
    game.ownerId !== null && String(game.ownerId) === String(play.user.id)
      ? {
          api: play.api,
          gameId: id,
          status: game.gameStatus,
          inviteCode: game.inviteCode,
          onStatus: game.setStatus,
        }
      : null;
  return <PlayBoard play={game} owner={owner} />;
};

const PlayGamePage = () => {
  const { id } = useParams();
  const play = useApi();

  return (
    <div className="p-4" data-testid="play-game">
      {play.status === "ready" ? (
        <PlayGame id={id} play={play} />
      ) : (
        <PlayNotice {...play} back={play.status === "error"} />
      )}
    </div>
  );
};

export default PlayGamePage;
