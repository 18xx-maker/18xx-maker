import { memo } from "react";
import { useTranslation } from "react-i18next";

import { Trash2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

import Svg from "@/components/svg/Svg";
import GameMapCompanyToken from "@/components/tokens/GameMapCompanyToken";

import ColorContext from "@/context/ColorContext";
import { cn } from "@/util/cn";

const CompanyPreviewView = ({ abbrev }) => (
  <Svg viewBox="-27 -27 54 54" className="size-8! shrink-0" aria-hidden="true">
    <ColorContext.Provider value="companies">
      <GameMapCompanyToken abbrev={abbrev} width={25} />
    </ColorContext.Provider>
  </Svg>
);
export const CompanyPreview = memo(CompanyPreviewView);

// How many tokens a company has, 0 when the game does not say
const total = (company) =>
  Array.isArray(company.tokens) ? company.tokens.length : 0;

// The tokens tab: the companies of the game with their tokens on the map, the
// chosen company and the selected token. Going over the tokens of a company
// warns and still places.
const TokenPanel = ({
  game,
  supply,
  chosen,
  onChoose,
  selected,
  locked,
  send,
}) => {
  const { t } = useTranslation();
  const companies = game.companies || [];
  const used = (abbrev) => supply[abbrev]?.used || 0;
  const company = companies.find((c) => c.abbrev === chosen);
  const over = company && total(company) > 0 && used(chosen) >= total(company);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {t("play.board.tokens.hint")}
      </p>
      {over && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <TriangleAlert className="size-4 shrink-0" />
          {t("play.board.tokens.overSupply")}
        </p>
      )}

      {selected && (
        <div className="flex flex-col gap-2 rounded-md border p-2">
          <span className="text-sm font-medium">
            {t("play.board.tokens.selected", {
              token: selected.token.token,
              hex: selected.hex,
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            disabled={locked}
            onClick={() =>
              send({
                type: "token.remove",
                hex: selected.hex,
                ...selected.token,
              })
            }
          >
            <Trash2 />
            {t("play.board.tokens.remove")}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1">
        {companies.map((c) => (
          <Button
            key={c.abbrev}
            variant="outline"
            data-company-option={c.abbrev}
            aria-pressed={chosen === c.abbrev}
            disabled={locked}
            onClick={() => onChoose(chosen === c.abbrev ? null : c.abbrev)}
            className={cn(
              "h-auto justify-start p-1 text-left",
              chosen === c.abbrev && "border-primary bg-accent",
            )}
          >
            <CompanyPreview abbrev={c.abbrev} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate">{c.abbrev}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {total(c) > 0
                  ? t("play.board.tokens.count", {
                      used: used(c.abbrev),
                      total: total(c),
                    })
                  : t("play.board.tokens.used", { used: used(c.abbrev) })}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TokenPanel;
