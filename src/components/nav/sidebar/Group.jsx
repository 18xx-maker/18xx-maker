import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";

const Group = ({ label, children }) => {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>{children}</SidebarMenu>
    </SidebarGroup>
  );
};
export default Group;
