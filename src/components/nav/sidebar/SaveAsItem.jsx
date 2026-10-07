import { useTranslation } from "react-i18next";

import { Copy } from "lucide-react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// Saves a copy of a bundled game, which has no file to save. The dialog it
// opens lives in the sidebar's parent: the mobile sidebar unmounts when it
// closes.
const SaveAsItem = ({ onClick }) => {
  const { t } = useTranslation();
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="font-medium"
        onClick={() => {
          // The picker has to open from the click, so start comes first
          onClick();
          if (isMobile) toggleSidebar();
        }}
      >
        <Copy />
        <span>{t("saveAs.nav")}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default SaveAsItem;
