import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ascend, compose, groupBy, keys, map, nth, sort, split } from "ramda";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { logos } from "@/data";
import { useStringParam } from "@/util/query";

const groupFor = compose(nth(0), split("/"));
const nameFor = compose(nth(1), split("/"));
const groups = groupBy(groupFor, keys(logos));
const groupNames = sort(
  ascend((x) => (x === "undefined" ? "" : x)),
  keys(groups),
);

const groupItems = map(
  (group) => (
    <SelectItem key={group} value={group}>
      {group}
    </SelectItem>
  ),
  groupNames,
);

// Classes that look the same on the back of a token
const SAME_ON_BACK = ["color-white", "color-stroke-white"];

const hasBack = (el) =>
  [...el.querySelectorAll('[class*="color-"]')].some((node) =>
    [...node.classList].some(
      (c) => c.startsWith("color-") && !SAME_ON_BACK.includes(c),
    ),
  );

const LogoCard = ({ logo, Component }) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [back, setBack] = useState(false);

  useEffect(() => {
    setBack(hasBack(ref.current));
  }, [logo]);

  const preview = (className, label) => (
    <div className="m-4">
      <Component
        className={className}
        width="100%"
        height="100%"
        style={{ overflow: "hidden" }}
      />
      {back && (
        <div className="text-center text-xs text-muted-foreground">{label}</div>
      )}
    </div>
  );

  return (
    <div className="border rounded-lg checkered overflow-hidden">
      <div ref={ref}>{preview(undefined, t("elements.logos.front"))}</div>
      {back &&
        preview("color-main-gray color-reserved", t("elements.logos.back"))}
      <div className="border-t center p-4 bg-background text-center">
        {logo}
      </div>
    </div>
  );
};

const Logos = () => {
  const { t } = useTranslation();
  const [group, setGroup] = useStringParam("group", groupNames[0]);

  const logoNodes = useMemo(
    () =>
      map((logo) => {
        let name = nameFor(logo);
        return (
          <LogoCard
            key={`logo-${group}-${name}`}
            logo={logo}
            Component={logos[logo]}
          />
        );
      }, groups[group]),
    [group],
  );

  return (
    <div className="p-4" data-testid="logos">
      <h1 className="text-4xl font-extrabold">{t("elements.logos.title")}</h1>
      <p className="leading-7 mt-6 text-wrap">
        {t("elements.logos.page.description")}
      </p>
      <div className="bg-muted flex flex-rows place-items-center rounded-xl border px-4 py-2 my-4">
        <Label htmlFor="logo-set" className="mr-2">
          {t("elements.logos.set")}
        </Label>
        <div className="w-min">
          <Select id="logo-set" defaultValue={group} onValueChange={setGroup}>
            <SelectTrigger>
              <SelectValue value={group} />
            </SelectTrigger>
            <SelectContent>{groupItems}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-10 gap-4">
        {logoNodes}
      </div>
    </div>
  );
};

export default Logos;
