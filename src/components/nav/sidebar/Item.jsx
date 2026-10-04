import { Link, useMatch } from "react-router";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import KeyLabel from "@/components/KeyLabel";

const Item = ({ to, label, icon, shortcut, append }) => {
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
        <Link
          to={to}
          onClick={onClick}
          className="font-medium"
          aria-current={active ? "page" : undefined}
        >
          <Icon />
          <span>
            {shortcut ? (
              <KeyLabel text={label} shortcut={shortcut} append={append} />
            ) : (
              label
            )}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
export default Item;
