import { useTranslation } from "react-i18next";

import { Download } from "lucide-react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Link } from "@/router";

const UpdateItem = ({ version }) => {
  const { t } = useTranslation();
  const { toggleSidebar, isMobile } = useSidebar();

  const onClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
      >
        <Link to="/app" onClick={onClick} className="font-semibold">
          <Download />
          <span>{t("nav.update", { version })}</span>
          <span
            aria-hidden="true"
            className="relative ml-auto flex size-2 shrink-0"
          >
            <span className="absolute inset-0 rounded-full bg-primary-foreground animate-ping motion-reduce:animate-none" />
            <span className="relative size-2 rounded-full bg-primary-foreground" />
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
export default UpdateItem;
