import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link, useMatch, useNavigate } from "react-router";

import { addIndex, find, is, map, propEq } from "ramda";

import { ArrowBigLeft, Bolt, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";

import ExportButton from "@/components/ExportButton";
import PrintButton from "@/components/PrintButton";
import { gameNav } from "@/components/gameNav";

import { useGame } from "@/hooks";
import { refreshGame } from "@/state";
import { trackEvent } from "@/util/analytics";
import capability from "@/util/capability";
import { isControlTarget } from "@/util/keys";
import { useBooleanParam, useIntParam } from "@/util/query";

const Toolbar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [paginated, togglePagination] = useBooleanParam("paginated");
  const [config, toggleConfig] = useBooleanParam("config");
  const [variation, setVariation] = useIntParam("variation", 0);
  const [hidePrivates, togglePrivates] = useBooleanParam("hidePrivates");
  const [hideShares, toggleShares] = useBooleanParam("hideShares");
  const [hideTrains, toggleTrains] = useBooleanParam("hideTrains");
  const [hideNumbers, toggleNumbers] = useBooleanParam("hideNumbers");

  const game = useGame();
  const slug = game.meta.slug;

  const match = useMatch("/games/:slug/:section/*");
  const item = find(propEq(match.params.section, "section"), gameNav);

  const handleKeyDown = useCallback(
    (event) => {
      if (isControlTarget(event)) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      if (event.key === "c") {
        toggleConfig();
        return;
      }

      const item = find(propEq(event.key, "key"), gameNav);

      if (item) {
        navigate(`/games/${slug}/${item.section}`);
      }
    },
    [slug, navigate, toggleConfig],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // b18 pages are for the box maker and an unknown section has nothing to show
  if (!item || match.params.section === "b18") {
    return null;
  }

  const onRefresh = (event) => {
    event.preventDefault();
    trackEvent("refresh", location);
    dispatch(refreshGame());
  };

  return (
    <div className="z-40 print:hidden fixed top-4 left-4 rounded-sm border p-1 flex flex-row gap-0.5 bg-background justify-start items-center">
      <Button asChild variant="outline" className="p-2-px w-8 h-8 m-0">
        <Link to={`/games/${slug}`} aria-label={t("game.info")}>
          <ArrowBigLeft width="24" height="24" />
        </Link>
      </Button>
      <Separator orientation="vertical" />
      <Toggle
        onPressedChange={toggleConfig}
        pressed={config}
        aria-label="config"
        variant="outline"
        className="rounded-sm p-2 w-8 h-8 m-0"
      >
        <Bolt className="w-6 h-6" />
      </Toggle>
      {!capability.electron && game.meta.type === "system" && (
        <>
          <Separator orientation="vertical" />
          <Button
            variant="outline"
            className="border rounded-sm p-2 w-8 h-8 m-0"
            onClick={onRefresh}
            aria-label={t("refresh.refresh")}
          >
            <RefreshCw className="size-6" />
          </Button>
        </>
      )}
      <Separator orientation="vertical" />
      <Select
        value={item.section}
        onValueChange={(section) => navigate(`/games/${slug}/${section}`)}
        className="w-60"
      >
        <SelectTrigger aria-label={t("game.sections")}>
          <SelectValue value={item.section} className="w-60" />
        </SelectTrigger>
        <SelectContent>
          {map((item) => {
            return (
              <SelectItem
                key={item.section}
                value={item.section}
                disabled={item.disabled?.(game)}
                className="w-48 flex flex-row"
              >
                {item.key && <span className="mr-2 italic">{item.key}:</span>}
                {t(`game.nav.${item.section}`)}
              </SelectItem>
            );
          }, gameNav)}
        </SelectContent>
      </Select>
      <Separator orientation="vertical" />
      {capability.electron ? <ExportButton /> : <PrintButton />}
      {item.section === "map" && is(Array, game.map) && (
        <Select
          value={`${variation}`}
          onValueChange={(value) => setVariation(parseInt(value))}
        >
          <SelectTrigger aria-label={t("game.map.variation")} className="ml-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {addIndex(map)(
              (m, i) => (
                <SelectItem key={`variation-${i}`} value={`${i}`}>
                  {m.name}
                </SelectItem>
              ),
              game.map,
            )}
          </SelectContent>
        </Select>
      )}
      {item.section === "cards" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2 h-8">
              {t("show")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[
              ["privates", hidePrivates, togglePrivates],
              ["shares", hideShares, toggleShares],
              ["trains", hideTrains, toggleTrains],
              ["numbers", hideNumbers, toggleNumbers],
            ].map(([name, hidden, toggle]) => (
              <DropdownMenuCheckboxItem
                key={name}
                checked={!hidden}
                onCheckedChange={toggle}
              >
                {t(`game.cards.${name}`)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {item.pagination && (
        <div className="ml-2 flex flex-row gap-2 justify-start items-center">
          <Label htmlFor="paginate-switch">Paginate</Label>
          <Switch
            id="paginate-switch"
            checked={paginated}
            onCheckedChange={togglePagination}
          />
        </div>
      )}
    </div>
  );
};

export default Toolbar;
