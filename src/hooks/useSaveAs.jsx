import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import SaveAsDialog from "@/components/pages/games/SaveAsDialog";

import { useLocation, useNavigate } from "@/router";
import { saveGameAs } from "@/state";
import { titleToFilename } from "@/util";
import { saveAsBackend } from "@/util/canSaveGame";

// Save as for a game that has no file. `start` saves straight away where the
// platform has its own dialog (a picker has to open from the click itself) and
// opens `dialog`, to render somewhere that stays mounted, where it has not.
export const useSaveAs = (game) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const available = !!game && saveAsBackend(game.meta.type) !== undefined;
  const suggested = game ? titleToFilename(game.info.title) : "";

  // Continues on the saved copy, on the same page of the game when on one
  const save = async (name, overwrite = false) => {
    const slug = await dispatch(
      saveGameAs({
        name,
        overwrite,
        dialog: {
          title: t("saveAs.title"),
          filter: t("saveAs.pickerDescription"),
        },
      }),
    );
    if (slug) {
      setOpen(false);
      const game = /^\/games\/[^/]+/;
      // Elsewhere (settings, docs) the user continues on the copy's map
      if (game.test(pathname)) {
        navigate(pathname.replace(game, `/games/${encodeURI(slug)}`), {
          replace: true,
        });
      } else {
        navigate(`/games/${encodeURI(slug)}/map`);
      }
    }
    return slug;
  };

  const start = () =>
    saveAsBackend(game.meta.type) === "internal"
      ? setOpen(true)
      : save(suggested);

  return {
    available,
    start,
    dialog: available && saveAsBackend(game.meta.type) === "internal" && (
      <SaveAsDialog
        open={open}
        onOpenChange={setOpen}
        defaultName={`${suggested}.json`}
        onSave={save}
      />
    ),
  };
};
