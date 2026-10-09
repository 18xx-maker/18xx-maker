import { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";

import { clearSaveConflict, useGame, useSaveAs, useSaveGame } from "@/hooks";
import { reloadGame, revertGame } from "@/state";
import { selectGameChanged, selectGameOriginal } from "@/state/selectors";
import { canSaveGame } from "@/util/canSaveGame";

const DiffView = lazy(() => import("@/components/pages/games/DiffView"));

const ChangesPage = () => {
  const game = useGame();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const slug = game.meta.slug;
  const original = useSelector(selectGameOriginal);
  const changed = useSelector(selectGameChanged);
  const { save: saveGame, saving, conflict } = useSaveGame();
  const saveAs = useSaveAs(game);

  // The conflict panel stays until a save works, so one found by the toolbar
  // or Cmd/Ctrl+S is shown here
  const save = (force) => saveGame({ force, redirect: false });

  const reload = async () => {
    await dispatch(reloadGame());
    clearSaveConflict();
  };

  return (
    <div className="p-4" data-testid={`game-${slug}-changes`}>
      <h1 className="text-4xl font-extrabold">{t("changes.title")}</h1>
      {!changed || !original ? (
        <p className="my-4">{t("changes.none")}</p>
      ) : (
        <>
          <div className="my-4 flex flex-row flex-wrap gap-2">
            {canSaveGame(game.meta.type) && (
              <Button disabled={saving} onClick={() => save(false)}>
                {t("changes.save")}
              </Button>
            )}
            {saveAs.available && (
              <Button onClick={saveAs.start}>{t("saveAs.nav")}</Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                clearSaveConflict();
                dispatch(revertGame());
              }}
            >
              {t("changes.revert")}
            </Button>
          </div>
          {conflict && (
            <div
              role="alert"
              className="my-4 max-w-3xl rounded-xl border p-4"
              data-testid="changes-conflict"
            >
              <p>{t("changes.conflict")}</p>
              <div className="mt-2 flex flex-row gap-2">
                <Button variant="outline" onClick={reload}>
                  {t("changes.reload")}
                </Button>
                <Button variant="destructive" onClick={() => save(true)}>
                  {t("changes.overwrite")}
                </Button>
              </div>
            </div>
          )}
          {canSaveGame(game.meta.type) && (
            <p className="my-2 max-w-3xl text-sm">{t("changes.reformat")}</p>
          )}
          <Suspense fallback={null}>
            <DiffView original={original} edited={game} />
          </Suspense>
          {saveAs.dialog}
        </>
      )}
    </div>
  );
};

export default ChangesPage;
