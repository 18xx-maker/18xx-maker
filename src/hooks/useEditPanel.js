import { useMatch } from "react-router";

import { find, propEq } from "ramda";

import { useEditor } from "@/hooks/useEditor";
import { gameNav } from "@/util/gameNav";
import { useBooleanParam, useTogglePanel } from "@/util/query";

// The edit panel (game info form) belongs to the sections of the toolbar: the
// ones with an edit toggle. The print page of an export has none.
export const useEditPanel = () => {
  const editor = useEditor();
  const match = useMatch("/games/:slug/:section/*");
  const [print] = useBooleanParam("print");
  const [open, toggle] = useTogglePanel("edit");

  const section = match?.params.section;
  const available =
    editor &&
    !print &&
    section !== "b18" &&
    !!find(propEq(section, "section"), gameNav);

  return { available, open: available && open, toggle };
};

export default useEditPanel;
