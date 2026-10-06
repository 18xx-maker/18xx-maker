import { useCallback, useEffect, useRef } from "react";
import { useLocation, useMatch, useNavigate } from "react-router";

import { find, propEq } from "ramda";

import {
  DEFAULT_EDIT_SECTION,
  sectionsFor,
} from "@/components/editPanel/sections";

import { useEditor } from "@/hooks/useEditor";
import { gameNav } from "@/util/gameNav";
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
  const match = useMatch("/games/:slug/:section/*");
  const [print] = useBooleanParam("print");
  const [open, toggle] = useTogglePanel("edit");
  const [param, setParam] = useStringParam("editSection", DEFAULT_EDIT_SECTION);
  const section = match?.params.section;
  // The tabs of the page, an unknown one in the url is the first one
  const sections = sectionsFor(section);
  const editSection = sections.some((s) => s.section === param)
    ? param
    : DEFAULT_EDIT_SECTION;

  // The selected lines belong to the JSON tab: leaving it drops them
  // (the tab already shown stays as it is, lines and history included)
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
    selected && (match?.params.section !== "map" || (available && !open));

  useEffect(() => {
    const changed = previous.current !== variation;
    previous.current = variation;
    if (!selected || !(stale || changed)) return;
    navigate({ search: clearHexSearch(search) }, { replace: true });
  }, [stale, selected, variation, search, navigate]);
};

const hasLines = (search) => new URLSearchParams(search).has("lines");

export default useEditPanel;
