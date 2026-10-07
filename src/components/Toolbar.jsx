import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useMatch, useNavigate } from "react-router";

import { addIndex, find, is, map, propEq } from "ramda";

import {
  ArrowBigLeft,
  Bolt,
  FileDiff,
  Pencil,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import KeyLabel from "@/components/KeyLabel";
import ExportButton from "@/components/export/ExportButton";
import PrintButton from "@/components/page/PrintButton";

import { useConfig, useGame } from "@/hooks";
import { useEditPanel } from "@/hooks/useEditPanel";
import { refreshGame } from "@/state";
import { selectGameChanged } from "@/state/selectors";
import { trackEvent } from "@/util/analytics";
import capability from "@/util/capability";
import { gameNav } from "@/util/gameNav";
import {
  openConfigSearch,
  useBooleanParam,
  useIntParam,
  useTogglePanel,
} from "@/util/query";

const Toolbar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();

  const [paginated, togglePagination] = useBooleanParam("paginated");
  const [config, toggleConfig] = useTogglePanel("config");
  const { open: edit, toggle: toggleEdit } = useEditPanel();
  const [variation, setVariation] = useIntParam("variation", 0);
  const [hidePrivates, togglePrivates] = useBooleanParam("hidePrivates");
  const [hideShares, toggleShares] = useBooleanParam("hideShares");
  const [hideTrains, toggleTrains] = useBooleanParam("hideTrains");
  const [hideNumbers, toggleNumbers] = useBooleanParam("hideNumbers");

  const game = useGame();
  const { gameConfigIgnored } = useConfig();
  const slug = game.meta.slug;
  const changed = useSelector(selectGameChanged);

  const match = useMatch("/games/:slug/:section/*");
  const item = find(propEq(match.params.section, "section"), gameNav);

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
      <Button asChild variant="outline" className="px-2 h-8 m-0 shrink-0">
        <Link to={`/games/${slug}`}>
          <ArrowBigLeft width="24" height="24" />
          <span className="max-md:sr-only">{t("game.info")}</span>
        </Link>
      </Button>
      <Separator orientation="vertical" />
      <Toggle
        onPressedChange={toggleConfig}
        pressed={config}
        variant="outline"
        className="rounded-sm px-2 h-8 m-0 shrink-0"
      >
        <Bolt className="w-6 h-6" />
        <span className="max-md:sr-only">{t("config.toggle")}</span>
      </Toggle>
      <Toggle
        onPressedChange={toggleEdit}
        pressed={edit}
        variant="outline"
        className="rounded-sm px-2 h-8 m-0 shrink-0"
      >
        <Pencil className="w-6 h-6" />
        <span className="max-md:sr-only">
          <KeyLabel text={t("editPanel.toggle")} shortcut="e" />
        </span>
      </Toggle>
      {gameConfigIgnored && (
        <>
          <Separator orientation="vertical" />
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="outline"
                  className="border rounded-sm px-2 h-8 m-0 shrink-0"
                >
                  <Link
                    to={{ search: openConfigSearch(search, "data") }}
                    data-testid="game-config-ignored"
                  >
                    <TriangleAlert className="size-6 text-amber-600 dark:text-amber-400" />
                    <span className="max-md:sr-only">
                      {t("config.gameConfigIgnored.short")}
                    </span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("config.gameConfigIgnored.tooltip")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
      {!capability.electron && game.meta.type === "system" && (
        <>
          <Separator orientation="vertical" />
          <Button
            variant="outline"
            className="border rounded-sm px-2 h-8 m-0 shrink-0"
            onClick={onRefresh}
          >
            <RefreshCw className="size-6" />
            <span className="max-md:sr-only">{t("refresh.refresh")}</span>
          </Button>
        </>
      )}
      {changed && (
        <>
          <Separator orientation="vertical" />
          <Button
            asChild
            variant="outline"
            className="border rounded-sm px-2 h-8 m-0 shrink-0"
          >
            <Link to={`/games/${slug}/changes`}>
              <FileDiff className="size-6" />
              <span className="max-md:sr-only">{t("changes.nav")}</span>
            </Link>
          </Button>
        </>
      )}
      <Separator orientation="vertical" />
      <Select
        value={item.section}
        onValueChange={(section) =>
          navigate({
            pathname: `/games/${slug}/${section}`,
            search,
          })
        }
        className="w-60"
      >
        <SelectTrigger
          aria-label={t("game.sections")}
          className="w-auto shrink-0"
        >
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
                {item.key && (
                  <span className="mr-2">
                    <u>{item.key}</u>:
                  </span>
                )}
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
          <SelectTrigger
            aria-label={t("game.map.variation")}
            className="ml-2 w-auto shrink-0"
          >
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
            <Button variant="outline" className="ml-2 h-8 shrink-0">
              {t("filter")}
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
                onSelect={(event) => event.preventDefault()}
              >
                {t(`game.cards.${name}`)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {item.pagination && (
        <div className="ml-2 flex shrink-0 flex-row gap-2 justify-start items-center whitespace-nowrap">
          <Label htmlFor="paginate-switch">
            <KeyLabel text={t("game.paginated")} shortcut="n" />
          </Label>
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
