import { describe, expect, it } from "vitest";

import { SECTION_KEYS, UNTABBED_KEYS } from "@/components/editPanel/EditNav";
import {
  DEFAULT_EDIT_SECTION,
  editGroups,
  editSections,
  formSections,
  groupSections,
  sectionsFor,
} from "@/components/editPanel/sections";

import de from "@/locales/de.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import schema from "@/schemas/game.schema.json";

const locales = { en, de, zh };
const locale = (lang) => locales[lang].editPanel;

describe("edit sections", () => {
  it("has unique ids", () => {
    const ids = editSections.map((s) => s.section);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("puts every form section in a known group, and only JSON is pinned", () => {
    for (const s of formSections) expect(editGroups).toContain(s.group);
    expect(editSections.filter((s) => s.pinned).map((s) => s.section)).toEqual([
      "json",
    ]);
    expect(formSections.map((s) => s.section)).not.toContain("json");
    expect(DEFAULT_EDIT_SECTION).toBe(formSections[0].section);
  });

  it("lists the groups in order and puts a section without a group in other", () => {
    const grouped = groupSections(formSections);
    expect(grouped.map((g) => g.group)).toEqual(editGroups);
    const extra = { section: "extra", Form: () => null };
    const other = groupSections([...formSections, extra]).at(-1);
    expect(other).toEqual({ group: "other", sections: [extra] });
  });

  it("maps every top level key of the game to a tab", () => {
    // A problem in a key without a tab would show on no tab
    // "map" problems show only for the selected variation (map tab) or group
    // (hex tab)
    const mapped = Object.values(SECTION_KEYS).flat();
    for (const key of Object.keys(schema.properties)) {
      if (key === "map") continue;
      expect([...mapped, ...UNTABBED_KEYS]).toContain(key);
    }
  });

  it("has the config tab before the pinned JSON, wide, with its dot source", () => {
    const ids = editSections.map((s) => s.section);
    expect(ids.indexOf("config")).toBe(ids.indexOf("json") - 1);
    expect(editSections.find((s) => s.section === "config").wide).toBe(true);
    expect(SECTION_KEYS.config).toEqual(["config"]);
    expect(UNTABBED_KEYS).not.toContain("config");
  });

  it("has a dot source for every form section", () => {
    for (const { section } of formSections) {
      expect([
        section,
        section === "hex" || section === "map" || section in SECTION_KEYS,
      ]).toEqual([section, true]);
    }
    for (const section of Object.keys(SECTION_KEYS)) {
      expect(formSections.map((s) => s.section)).toContain(section);
    }
  });

  it("has the map tab before the hex tab, for the map page only", () => {
    const ids = editSections.map((s) => s.section);
    expect(ids.indexOf("map")).toBe(ids.indexOf("hex") - 1);
    const map = editSections.find((s) => s.section === "map");
    expect([map.group, map.page]).toEqual(["output", "map"]);
    expect(sectionsFor("map").map((s) => s.section)).toContain("map");
    expect(sectionsFor("market").map((s) => s.section)).not.toContain("map");
  });

  it.each(["en", "de", "zh"])("has the map form strings in %s", (lang) => {
    const strings = locale(lang);
    for (const key of ["borders", "lines", "borderTexts"]) {
      expect(strings.items[key]).toBeTruthy();
      expect(strings.headings[key]).toBeTruthy();
    }
    for (const key of ["mapMarket", "mapPlayers"]) {
      expect(strings.headings[key]).toBeTruthy();
    }
    for (const key of ["hideTitle", "copy", "inherited"]) {
      expect(strings.map[key]).toBeTruthy();
    }
  });

  it.each(["en", "de", "zh"])("has the strings in %s", (lang) => {
    const strings = locale(lang);
    for (const s of editSections) {
      expect(strings.sections[s.section].tab).toBeTruthy();
      expect(strings.sections[s.section].description).toBeTruthy();
    }
    for (const group of [...editGroups, "other"]) {
      expect(strings.groups[group]).toBeTruthy();
    }
  });
});
