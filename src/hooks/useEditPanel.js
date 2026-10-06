import { useCallback, useEffect, useRef } from "react";
import { useLocation, useMatch, useNavigate } from "react-router";

import { find, propEq } from "ramda";

import {
  DEFAULT_EDIT_SECTION,
  groupSections,
  sectionsFor,
} from "@/components/editPanel/sections";

import { useEditor } from "@/hooks/useEditor";
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

// The form section the panel was on before the JSON switch, so Forms goes back
// to it. Not persisted; the hook and the bindings share it.
let lastForm = null;

// The edit panel (forms for parts of the game) belongs to the sections of the toolbar: the
// ones with an edit toggle. The print page of an export has none, nor has render mode.
export const useEditPanel = () => {
  const editor = useEditor();
  const match = useMatch("/games/:slug/:section/*");
  const [print] = useBooleanParam("print");
  const [open, toggle] = useTogglePanel("edit");
  const [param, setParam] = useStringParam("editSection", DEFAULT_EDIT_SECTION);
  const section = match?.params.section;
  // The sections of the page, the forms in the order of their groups. An
  // unknown one in the url is the first form.
  const sections = sectionsFor(section);
  const groups = groupSections(sections.filter((s) => !s.pinned));
  const forms = groups.flatMap((g) => g.sections);
  const editSection = sections.some((s) => s.section === param)
    ? param
    : forms[0].section;
  const json = editSection === "json";
  if (!json) lastForm = editSection;
  // The form Forms goes back to: the last one, unless the page has no such one
  const formSection = forms.some((s) => s.section === lastForm)
    ? lastForm
    : forms[0].section;

  // The selected lines belong to the JSON editor: leaving it drops them
  // (the section already shown stays as it is, lines and history included)
  const setEditSection = useCallback(
    (next) => {
      if (next === editSection) return;
      setParam(next, { drop: ["lines"] });
    },
    [setParam, editSection],
  );

  const available =
    editor &&
    !print &&
    !getRenderInput() &&
    section !== "b18" &&
    !!find(propEq(section, "section"), gameNav);

  return {
    available,
    open: available && open,
    toggle,
    sections,
    groups,
    forms,
    formSection,
    json,
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
