import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Link } from "@/router";

// The games the signed in user plays in
const PlayList = ({ api }) => {
  const { t } = useTranslation();
  const [games, setGames] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let live = true;
    api
      .listGames()
      .then((list) => live && setGames(list))
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [api]);

  if (error) return <p role="alert">{t("play.error", { message: error })}</p>;
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
