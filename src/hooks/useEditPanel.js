import { useCallback, useEffect } from "react";
import { useLocation, useMatch, useNavigate } from "react-router";

import { find, propEq } from "ramda";

import {
  DEFAULT_EDIT_SECTION,
  editSections,
} from "@/components/editPanel/sections";

import { useEditor } from "@/hooks/useEditor";
import { gameNav } from "@/util/gameNav";
import {
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
  // An unknown section in the url is the first one
  const editSection = editSections.some((s) => s.section === param)
    ? param
    : DEFAULT_EDIT_SECTION;

  // The selected lines belong to the JSON tab: leaving it drops them
  const setEditSection = useCallback(
    (next) => setParam(next, { drop: ["lines"] }),
    [setParam],
  );

  const section = match?.params.section;
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

const hasLines = (search) => new URLSearchParams(search).has("lines");

export default useEditPanel;
