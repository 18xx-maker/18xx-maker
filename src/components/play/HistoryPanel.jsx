import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { describeEvent } from "@/play/history";
import { effectiveEvents } from "@/play/reduce";
import { cn } from "@/util/cn";

// The log, newest first. A move cancelled by an undo is struck through.
const HistoryPanel = ({ log = [], seats = [] }) => {
  const { t } = useTranslation();
  const { live, bySeq, events } = useMemo(
    () => ({
      live: new Set(effectiveEvents(log).map((e) => e.seq)),
      bySeq: new Map(log.map((e) => [e.seq, e])),
      events: [...log].sort((a, b) => b.seq - a.seq),
    }),
    [log],
  );
  const name = (userId) => {
    const seat = seats.find((s) => s.userId === userId);
    return seat?.name || (userId === undefined ? "" : String(userId));
  };
  // A tray is the bank or a seat (by user id); an unknown one shows its id
  const place = (id) => {
    if (id === "bank") return t("play.board.history.bank");
    const seat = seats.find((s) => String(s.userId) === id);
    return seat?.name || id;
  };

  if (!events.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("play.board.history.empty")}
      </p>
    );
  }

  return (
    <ol
      aria-label={t("play.board.history.label")}
      className="flex flex-col gap-1 text-sm"
    >
      {events.map((event) => {
        const { key, params } = describeEvent(event, { seats });
        if (event.userId === undefined) {
          params.user = t("play.board.history.unknownUser");
        }
        if (event.type === "undo") {
          const target = bySeq.get(event.target);
          params.owner =
            (target && name(target.userId)) ||
            t("play.board.history.unknownUser");
        }
        if (event.type === "tray.move") {
          params.from = place(params.from);
          params.to = place(params.to);
        }
        const cancelled = !live.has(event.seq);
        return (
          <li
            key={event.seq}
            data-testid="play-history-event"
            data-cancelled={cancelled ? "true" : undefined}
            className={cn(
              "rounded-md border px-2 py-1",
              cancelled && "text-muted-foreground line-through",
            )}
          >
            {t(key, params)}
          </li>
        );
      })}
    </ol>
  );
};

export default HistoryPanel;
