import { Link, useMatch } from "react-router";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const Item = ({ to, label, icon }) => {
  const { toggleSidebar, isMobile } = useSidebar();
  const match = useMatch(to);
  const active = !!match;
  let Icon = icon;

  const onClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active}>
        <Link to={to} onClick={onClick} className="font-medium">
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
export default Item;
