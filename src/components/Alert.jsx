import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-react";

import { Progress } from "@/components/ui/progress";

import { useAlerts } from "@/hooks";
import { clearAlert } from "@/state";
import { useBooleanParam } from "@/util/query";

const ICONS = {
  success: CircleCheck,
  info: Info,
  warning: TriangleAlert,
  error: CircleX,
};

const BAR = {
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  error: "bg-error",
};

const TEXT = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  error: "text-error",
};

const EXIT_MS = 150;

const reducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Toast = ({ alert, leaving, onDismiss }) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const remaining = useRef(alert.duration);
  const paused = hovered || focused;
  const type = alert.type || "info";
  const Icon = ICONS[type] || Info;
  const hasProgress = alert.progress !== undefined && alert.progress !== null;

  // Counts down while neither hovered nor focused, keeping what is left
  useEffect(() => {
    if (leaving || alert.sticky || paused || !remaining.current) return;
    const start = Date.now();
    const timeout = setTimeout(() => onDismiss(alert.id), remaining.current);
    return () => {
      clearTimeout(timeout);
      remaining.current -= Date.now() - start;
    };
  }, [alert.id, alert.sticky, leaving, paused, onDismiss]);

  return (
    <div
      data-testid="alert"
      data-type={type}
      data-state={leaving ? "closed" : "open"}
      aria-live={
        type === "error" || type === "warning" ? "assertive" : undefined
      }
      className={clsx(
        "pointer-events-auto relative overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg",
        "py-3 pl-5 pr-10",
        "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:slide-in-from-bottom-2",
        "motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:slide-out-to-right-4",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onDismiss(alert.id);
      }}
    >
      <span
        aria-hidden="true"
        className={clsx("absolute inset-y-0 left-0 w-1", BAR[type])}
      />
      <div className="flex items-start gap-2">
        <Icon
          aria-hidden="true"
          className={clsx("mt-0.5 size-4 shrink-0", TEXT[type])}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold break-words">{alert.title}</p>
          {hasProgress && (
            <div className="my-2">
              <Progress value={alert.progress} />
            </div>
          )}
          {alert.message && (
            <p className="text-sm text-muted-foreground break-words line-clamp-4">
              {alert.message}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-label={t("ui.close")}
        className="absolute right-2 top-2 rounded-sm p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onDismiss(alert.id)}
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
};

// Keeps a removed toast for the length of its exit animation
const useLeaving = (alerts) => {
  const [shown, setShown] = useState(() =>
    alerts.map((alert) => ({ alert, leaving: false })),
  );

  useEffect(() => {
    setShown((prev) => {
      if (
        prev.length === alerts.length &&
        prev.every((entry, i) => !entry.leaving && entry.alert === alerts[i])
      ) {
        return prev;
      }
      const ids = new Set(alerts.map((a) => a.id));
      const result = alerts.map((alert) => ({ alert, leaving: false }));
      if (reducedMotion()) return result;
      prev.forEach((entry, index) => {
        if (!ids.has(entry.alert.id)) {
          result.splice(Math.min(index, result.length), 0, {
            alert: entry.alert,
            leaving: true,
          });
        }
      });
      return result;
    });
  }, [alerts]);

  useEffect(() => {
    if (!shown.some((entry) => entry.leaving)) return;
    const timeout = setTimeout(
      () => setShown((prev) => prev.filter((entry) => !entry.leaving)),
      EXIT_MS,
    );
    return () => clearTimeout(timeout);
  }, [shown]);

  return shown;
};

const Alert = () => {
  const { t } = useTranslation();
  const [print] = useBooleanParam("print");
  const dispatch = useDispatch();
  const alerts = useAlerts();
  const shown = useLeaving(alerts);
  const dismiss = useCallback((id) => dispatch(clearAlert(id)), [dispatch]);

  if (print) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label={t("alerts.region")}
      aria-live="polite"
      className="pointer-events-none print:hidden fixed z-50 inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] md:inset-x-auto md:right-4 md:bottom-4 md:w-96 flex flex-col gap-2"
    >
      {shown.map(({ alert, leaving }) => (
        <Toast
          key={alert.id}
          alert={alert}
          leaving={leaving}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
};

export default Alert;
