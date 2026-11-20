import { useTranslation } from "react-i18next";

import { Users } from "lucide-react";

// Who is at the board now, by the names of their seats (avatars come later)
const Presence = ({ presence = [], seats = [] }) => {
  const { t } = useTranslation();
  if (!presence.length) return null;
  const names = presence.map((userId) => {
    const seat = seats.find((s) => s.userId === userId);
    return seat?.name || String(userId);
  });

  return (
    <span
      data-testid="play-presence"
      className="flex items-center gap-1 text-sm text-muted-foreground"
    >
      <Users className="size-4" aria-hidden="true" />
      {t("play.board.presence", { names: names.join(", ") })}
    </span>
  );
};

export default Presence;
