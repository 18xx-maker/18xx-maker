import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

// The one list of keybindings, shown in the ? dialog and in the docs. The keys
// are handled in src/hooks/bindings.js. Text is under "shortcuts.keys.<id>".
const shortcuts = [
  { id: "escape", keys: ["Esc"] },
  { id: "docs", keys: ["d"] },
  { id: "help", keys: ["?"] },
  { id: "home", keys: ["h"] },
  { id: "load", keys: ["l"] },
  { id: "open", keys: ["o"] },
  { id: "refresh", keys: ["r"] },
  { id: "atoms", keys: ["a"] },
  { id: "tiles", keys: ["t"] },
  { id: "logos", keys: ["c"] },
  { id: "game", keys: ["g"] },
  { id: "edit", keys: ["e"] },
  { id: "section", keys: ["m", "1–9", "0"] },
  { id: "view", keys: ["v"] },
  { id: "export", keys: ["x"] },
  { id: "app", keys: ["u"] },
];

const Kbd = ({ children }) => (
  <kbd className="rounded-md border bg-accent px-1.5 py-0.5 font-mono text-sm">
    {children}
  </kbd>
);

const Shortcuts = () => {
  const { t } = useTranslation();

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2 text-left font-bold">
              {t("shortcuts.key")}
            </th>
            <th className="border px-4 py-2 text-left font-bold">
              {t("shortcuts.use")}
            </th>
            <th className="border px-4 py-2 text-left font-bold">
              {t("shortcuts.notes")}
            </th>
          </tr>
        </thead>
        <tbody>
          {shortcuts.map(({ id, keys }) => (
            <tr key={id} className="m-0 border-t p-0 even:bg-muted">
              <td className="border px-4 py-2 text-left">
                <span className="flex flex-wrap gap-1">
                  {keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </span>
              </td>
              <td className="border px-4 py-2 text-left">
                {t(`shortcuts.keys.${id}.use`)}
              </td>
              <td className="border px-4 py-2 text-left">
                {t(`shortcuts.keys.${id}.notes`, "")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 leading-7">{t("shortcuts.exportMenu")}</p>
    </div>
  );
};

export const ShortcutsDialog = ({ open, onOpenChange }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t("shortcuts.title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("shortcuts.description")}
        </DialogDescription>
        <div data-testid="shortcuts" className="overflow-y-auto">
          <Shortcuts />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Shortcuts;
