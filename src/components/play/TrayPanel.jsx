import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BANK = "bank";

// The trays: the bank and one per seat (by user id), then any other tray of
// the log, so an item of a seat that is gone still shows
const trayList = (seats, trays, t) => {
  const list = [
    { id: BANK, name: t("play.board.trays.bank") },
    ...seats.map((seat) => ({
      id: String(seat.userId),
      name: seat.name || String(seat.userId),
    })),
  ];
  for (const id of Object.keys(trays)) {
    if (!list.some((tray) => tray.id === id)) list.push({ id, name: id });
  }
  return list;
};

// A select that sends what is picked and shows its label again
const ActionSelect = ({ label, disabled, onChange, children }) => (
  <Select value="" onValueChange={onChange} disabled={disabled}>
    <SelectTrigger aria-label={label} className="h-8 w-auto gap-1">
      <SelectValue placeholder={label} />
    </SelectTrigger>
    <SelectContent>{children}</SelectContent>
  </Select>
);

// The trays tab: what every player and the bank hold. Items are company
// abbrevs and tile ids of the game; the bank is where new items come from.
const TrayPanel = ({ game, tiles, seats, trays, locked, send }) => {
  const { t } = useTranslation();
  const list = trayList(seats, trays, t);
  const companies = (game.companies || []).map((c) => c.abbrev).filter(Boolean);
  const move = (item, from, to) => send({ type: "tray.move", item, from, to });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {t("play.board.trays.hint")}
      </p>
      {list.map((tray) => {
        const items = trays[tray.id] || [];
        return (
          <section
            key={tray.id}
            role="group"
            aria-label={tray.name}
            className="flex flex-col gap-2 rounded-md border p-2"
          >
            <h2 className="text-sm font-medium">{tray.name}</h2>
            {items.length ? (
              <ul className="flex flex-col gap-1">
                {items.map((item, i) => (
                  <li
                    key={`${item}-${i}`}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate">{item}</span>
                    <ActionSelect
                      label={t("play.board.trays.move", { item })}
                      disabled={locked}
                      onChange={(to) => move(item, tray.id, to)}
                    >
                      {list
                        .filter((other) => other.id !== tray.id)
                        .map((other) => (
                          <SelectItem key={other.id} value={other.id}>
                            {other.name}
                          </SelectItem>
                        ))}
                    </ActionSelect>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("play.board.trays.empty")}
              </p>
            )}
            {tray.id !== BANK && (
              <ActionSelect
                label={t("play.board.trays.add")}
                disabled={locked}
                onChange={(item) => move(item, BANK, tray.id)}
              >
                <SelectGroup>
                  <SelectLabel>{t("play.board.trays.companies")}</SelectLabel>
                  {companies.map((abbrev) => (
                    <SelectItem key={`company-${abbrev}`} value={abbrev}>
                      {abbrev}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>{t("play.board.trays.tiles")}</SelectLabel>
                  {tiles
                    .filter((id) => !companies.includes(id))
                    .map((id) => (
                      <SelectItem key={`tile-${id}`} value={id}>
                        {id}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </ActionSelect>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default TrayPanel;
