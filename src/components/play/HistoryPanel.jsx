import { useTranslation } from "react-i18next";

import { describeEvent } from "@/play/history";
import { effectiveEvents } from "@/play/reduce";
import { cn } from "@/util/cn";

// The log, newest first. A move cancelled by an undo is struck through.
const HistoryPanel = ({ log = [], seats = [] }) => {
  const { t } = useTranslation();
  const live = new Set(effectiveEvents(log).map((e) => e.seq));
  const bySeq = new Map(log.map((e) => [e.seq, e]));
  const name = (userId) => {
    const seat = seats.find((s) => s.userId === userId);
    return seat?.name || (userId === undefined ? "" : String(userId));
  };
  // A tray is the bank or a seat
  const place = (id) => (id === "bank" ? t("play.board.history.bank") : id);
  const events = [...log].sort((a, b) => b.seq - a.seq);

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
