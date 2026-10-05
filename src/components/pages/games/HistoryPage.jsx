import { Suspense, lazy, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

import { useGame } from "@/hooks";
import { restoreGame } from "@/state";
import { selectGameHistory } from "@/state/selectors";

const DiffView = lazy(() => import("@/components/pages/games/DiffView"));

const HistoryPage = () => {
  const game = useGame();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const slug = game.meta.slug;
  const history = useSelector(selectGameHistory);
  const [open, setOpen] = useState(null);

  const restore = (index) => {
    dispatch(restoreGame(index));
    navigate(`/games/${slug}/changes`);
  };

  return (
    <div className="p-4" data-testid={`game-${slug}-history`}>
      <h1 className="text-4xl font-extrabold">{t("history.title")}</h1>
      {history.length === 0 ? (
        <p className="my-4">{t("history.none")}</p>
      ) : (
        <>
          <p className="my-4 max-w-3xl">{t("history.description")}</p>
          <ul className="max-w-4xl rounded-xl border px-4">
            {history.map((entry, index) => (
              <li
                key={entry.savedAt}
                className="border-t py-3 first:border-t-0"
              >
                <div className="flex flex-row flex-wrap items-center gap-2">
                  <span className="mr-auto">
                    {new Date(entry.savedAt).toLocaleString(i18n.language)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(open === index ? null : index)}
                  >
                    {open === index ? t("history.hide") : t("history.view")}
                  </Button>
                  <Button size="sm" onClick={() => restore(index)}>
                    {t("history.restore")}
                  </Button>
                </div>
                {open === index && (
                  <Suspense fallback={null}>
                    <DiffView original={entry.game} edited={game} />
                  </Suspense>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default HistoryPage;
