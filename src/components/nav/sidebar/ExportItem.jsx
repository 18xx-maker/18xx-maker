import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { Images } from "lucide-react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import KeyLabel from "@/components/KeyLabel";
import { EXPORT_TRIGGER } from "@/components/export/ExportHost";

import { createSetExportMenuOpen } from "@/state";

// Opens the export menu of the loaded game, which ExportHost shows
const ExportItem = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toggleSidebar, isMobile } = useSidebar();

  const onClick = () => {
    // The sheet of the mobile sidebar is closed to show the menu
    if (isMobile) toggleSidebar();
    dispatch(createSetExportMenuOpen(true));
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="font-medium"
        aria-haspopup="menu"
        {...(isMobile ? {} : { [EXPORT_TRIGGER]: "" })}
        onClick={onClick}
      >
        <Images />
        <span>
          <KeyLabel text={t("export.label")} shortcut="x" />
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default ExportItem;
