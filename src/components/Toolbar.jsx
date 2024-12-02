import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link, useMatch, useNavigate } from "react-router";

import { find, map, propEq } from "ramda";

import { ArrowBigLeft, Bolt, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { useGame } from "@/hooks";
import { refreshGame } from "@/state";
import { trackEvent } from "@/util/analytics";
import capability from "@/util/capability";
import { useBooleanParam } from "@/util/query";

const gameNav = [
  {
    key: "1",
    section: "map",
    pagination: true,
  },
  {
    key: "2",
    section: "tiles",
  },
  {
    key: "3",
    section: "tokens",
  },
  {
    key: "4",
    section: "cards",
  },
  {
    key: "5",
    section: "charters",
  },
  {
    key: "6",
    section: "market",
    pagination: true,
  },
  {
    key: "7",
    section: "background",
  },
];

const Toolbar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [paginated, togglePagination] = useBooleanParam("paginated");

  const game = useGame();
  const slug = game.meta.slug;

  const match = useMatch("/games/:slug/:section/*");
  const item = find(propEq(match.params.section, "section"), gameNav);

  const handleKeyDown = useCallback(
    (event) => {
      const tag = event.target.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const item = find(propEq(event.key, "key"), gameNav);

      if (item) {
        navigate(`/games/${slug}/${item.section}`);
      }
    },
    [slug, navigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (match.params.section === "b18") {
    return null;
  }

  const onRefresh = (event) => {
    event.preventDefault();
    trackEvent("refresh", location);
    dispatch(refreshGame());
  };

  return (
    <div className="z-50 print:hidden fixed top-4 left-4 rounded-sm border p-1 flex flex-row gap-0.5 bg-background justify-start items-center">
      <Button
        asChild
        variant="outline"
        className="border rounded-sm p-2-px w-8 h-8 m-0"
      >
        <Link to={`/games/${slug}`}>
          <ArrowBigLeft width="24" height="24" />
        </Link>
      </Button>
      <Separator orientation="vertical" />
      <Button variant="outline" className="border rounded-sm p-2 w-8 h-8 m-0">
        <Bolt className="w-6 h-6" />
      </Button>
      {!capability.electron && game.meta.type === "system" && (
        <>
          <Separator orientation="vertical" />
          <Button
            variant="outline"
            className="border rounded-sm p-2 w-8 h-8 m-0"
            onClick={onRefresh}
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
        <SelectTrigger>
          <SelectValue value={item.section} className="w-60" />
        </SelectTrigger>
        <SelectContent>
          {map((item) => {
            return (
              <SelectItem
                key={item.section}
                value={item.section}
                className="w-48 flex flex-row"
              >
                <span className="mr-2 italic">{item.key}:</span>
                {t(`game.nav.${item.section}`)}
              </SelectItem>
            );
          }, gameNav)}
        </SelectContent>
      </Select>
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
