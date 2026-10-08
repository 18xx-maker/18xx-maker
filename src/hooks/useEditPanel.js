import { useCallback, useEffect, useRef } from "react";

import { find, propEq } from "ramda";

import {
  DEFAULT_EDIT_SECTION,
  editSections,
  groupSections,
} from "@/components/editPanel/sections";

import { useGame } from "@/hooks/game";
import { getLastForm, resetLastForm, setLastForm } from "@/hooks/lastForm";
import { useEditor } from "@/hooks/useEditor";
import { useLocation, useMatch, useNavigate } from "@/router";
import { gameNav } from "@/util/gameNav";
import { COORD_PATTERN } from "@/util/hexEdit";
import {
  clearHexSearch,
  searchString,
  useBooleanParam,
  useStringParam,
  useTogglePanel,
} from "@/util/query";
import { getRenderInput } from "@/util/renderInput";

// The edit panel (forms for parts of the game) belongs to the sections of the toolbar: the
// ones with an edit toggle. The print page of an export has none, nor has render mode.
export const useEditPanel = () => {
  const editor = useEditor();
  const game = useGame();
  const match = useMatch("/games/:slug/:section/*");
  const [print] = useBooleanParam("print");
  const [open, toggle] = useTogglePanel("edit");
  const [param, setParam] = useStringParam("editSection", DEFAULT_EDIT_SECTION);
  const section = match?.params.section;
  const navigate = useNavigate();
  const { search } = useLocation();
  const slug = match?.params.slug;
  // The sections on every page but the ones of a page the game has not (a
  // game without a map has no Map or Hex tab), the forms in the order of their
  // groups. An unknown one in the url is the first form.
  const sections = editSections.filter((s) => {
    const item = s.page && find(propEq(s.page, "section"), gameNav);
    return !(item && game && item.disabled?.(game));
  });
  const groups = groupSections(sections.filter((s) => !s.pinned));
  const forms = groups.flatMap((g) => g.sections);
  const editSection = sections.some((s) => s.section === param)
    ? param
    : forms[0].section;
  const json = editSection === "json";
  const problems = editSection === "problems";

  // The selected lines belong to the JSON editor: leaving it drops them
  // (the section already shown stays as it is, lines and history included).
  // A section of another page (tiles, map, hex) goes to that page, with the
  // panel open on it and the selected hex and tile dropped.
  const setEditSection = useCallback(
    (next) => {
      const page = editSections.find((s) => s.section === next)?.page;
      if (page && page !== section && slug) {
        const params = new URLSearchParams(search);
        ["lines", "hex", "tile"].forEach((name) => params.delete(name));
        params.set("edit", true);
        params.set("editSection", encodeURIComponent(next));
        navigate({
          pathname: `/games/${slug}/${page}`,
          search: searchString(params),
        });
        return;
      }
      if (next === editSection) return;
      setParam(next, { drop: ["lines"] });
    },
    [setParam, editSection, section, slug, search, navigate],
  );

  const available =
    editor &&
    !print &&
    !getRenderInput() &&
    section !== "b18" &&
    !!find(propEq(section, "section"), gameNav);

  // Closing the panel forgets the form
  if (available && !open) resetLastForm();
  else if (available && !json && !problems) setLastForm(editSection);
  // The form Forms goes back to: the last one, unless it belongs to another
  // page (Forms never changes the page) or the game has no such one
  const last = forms.find((s) => s.section === getLastForm());
  const formSection =
    last && (!last.page || last.page === section)
      ? last.section
      : forms[0].section;

  return {
    available,
    open: available && open,
    toggle,
    sections,
    groups,
    forms,
    formSection,
    json,
    problems,
    editSection,
    setEditSection,
  };
};

// A link with lines on anything but the JSON tab of an open edit panel (an
// older link, a hand edit) has them dropped, with no history entry
export const useDropStaleLines = ({ available, open, editSection }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const stale =
    available && !(open && editSection === "json") && hasLines(search);

  useEffect(() => {
    if (!stale) return;
    const params = new URLSearchParams(search);
    params.delete("lines");
    navigate({ search: searchString(params) }, { replace: true });
  }, [stale, search, navigate]);
};

// The hex selected on the map belongs to the open edit panel on the map. A link
// with one anywhere else, or after the panel was closed, has it dropped, and so
// does a change of variation, with no history entry. While the game loads the
// panel is not available yet: the selection waits.
export const useDropStaleHex = ({ available, open }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const match = useMatch("/games/:slug/:section/*");
  const params = new URLSearchParams(search);
  const variation = params.get("variation");
  const previous = useRef(variation);
  const selected = params.has("hex");
  const stale =
    selected &&
    (!COORD_PATTERN.test(params.get("hex")) ||
      match?.params.section !== "map" ||
      (available && !open));

  useEffect(() => {
    const changed = previous.current !== variation;
    previous.current = variation;
    if (!selected || !(stale || changed)) return;
    navigate({ search: clearHexSearch(search) }, { replace: true });
  }, [stale, selected, variation, search, navigate]);
};

const hasLines = (search) => new URLSearchParams(search).has("lines");

export default useEditPanel;
