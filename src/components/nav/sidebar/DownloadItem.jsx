import { useTranslation } from "react-i18next";

import { Download } from "lucide-react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import KeyLabel from "@/components/KeyLabel";

import { downloadGame } from "@/util/download";

// Saves the game file of the loaded game
const DownloadItem = ({ game }) => {
  const { t } = useTranslation();
  const { toggleSidebar, isMobile } = useSidebar();

  const onClick = () => {
    if (isMobile) toggleSidebar();
    downloadGame(game);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="font-medium" onClick={onClick}>
        <Download />
        <span>
          <KeyLabel text={t("download")} shortcut="d" />
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default DownloadItem;
