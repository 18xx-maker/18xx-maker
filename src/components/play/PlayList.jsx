import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import { Link } from "@/router";

// The games the signed in user plays in
const PlayList = ({ api }) => {
  const { t } = useTranslation();
  const [games, setGames] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    api
      .listGames()
      .then((list) => live && setGames(list))
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [api, attempt]);

  if (error) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p role="alert">{t("play.error", { message: error })}</p>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setError(null);
              setAttempt((n) => n + 1);
            }}
          >
            {t("play.retry")}
          </Button>
          <Button asChild variant="outline">
            <Link to="/settings">{t("play.settings")}</Link>
          </Button>
        </div>
      </div>
    );
  }
  if (!games) return <p>{t("play.loading")}</p>;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-2">{t("play.list.title")}</h2>
      {games.length === 0 ? (
        <p>{t("play.list.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {games.map((game) => (
            <li key={game.id}>
              <Link
                className="underline"
                to={`/play/${encodeURIComponent(game.id)}`}
              >
                {game.title}
              </Link>{" "}
              <span className="text-muted-foreground text-sm">
                {t(`play.list.status.${game.status}`, {
                  defaultValue: game.status,
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PlayList;
