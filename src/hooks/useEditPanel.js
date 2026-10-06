import { useMatch } from "react-router";

import { find, propEq } from "ramda";

import {
  DEFAULT_EDIT_SECTION,
  editSections,
} from "@/components/editPanel/sections";

import { useEditor } from "@/hooks/useEditor";
import { gameNav } from "@/util/gameNav";
import { useBooleanParam, useStringParam, useTogglePanel } from "@/util/query";
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
    setEditSection: setParam,
  };
};

export default useEditPanel;
