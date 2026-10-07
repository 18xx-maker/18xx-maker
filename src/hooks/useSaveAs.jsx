import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";

import SaveAsDialog from "@/components/pages/games/SaveAsDialog";

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

  // Continues on the saved copy, on the same page of the game
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
      navigate(
        pathname.replace(/^\/games\/[^/]+/, `/games/${encodeURI(slug)}`),
        {
          replace: true,
        },
      );
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
