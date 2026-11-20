import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const MAX_NOTES = 10000;

// The notes tab: one text for the whole game. An edit is saved once, when
// the field loses focus. The edit stays shown until the notes of the game
// change (the server echoes it), while editing the field is not replaced.
const NotesPanel = ({ notes, locked, send }) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(null);
  const editing = useRef(false);
  const text = draft ?? notes;
  const tooLong = text.length > MAX_NOTES;

  useEffect(() => {
    if (!editing.current) setDraft(null);
  }, [notes]);

  const onBlur = () => {
    editing.current = false;
    if (draft === null || draft === notes) {
      setDraft(null);
    } else if (draft.length <= MAX_NOTES) {
      send({ type: "note.set", text: draft });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="play-notes">{t("play.board.notes.label")}</Label>
      <p className="text-sm text-muted-foreground">
        {t("play.board.notes.hint")}
      </p>
      <Textarea
        id="play-notes"
        className="min-h-48"
        value={text}
        disabled={locked}
        aria-invalid={tooLong}
        aria-describedby={tooLong ? "play-notes-error" : undefined}
        onFocus={() => {
          editing.current = true;
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={onBlur}
      />
      {tooLong && (
        <p
          id="play-notes-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {t("play.board.notes.tooLong", {
            max: MAX_NOTES,
            length: text.length,
          })}
        </p>
      )}
    </div>
  );
};

export default NotesPanel;
