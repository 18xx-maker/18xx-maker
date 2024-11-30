import { useTranslation } from "react-i18next";

import { addIndex, map } from "ramda";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { mainMenu } from "@/components/nav";
import Group from "@/components/nav/sidebar/Group";
import Item from "@/components/nav/sidebar/Item";

import version from "@/util/version";

const AppSidebar = (props) => {
  const { t } = useTranslation();

  const renderItems = (items) => {
    return addIndex(map)((item, index) => {
      if (item.sep) {
        return <Separator key={`sep-${index}`} />;
      }

      if (item.items) {
        return (
          <Group key={item.label || `group-${index}`} label={t(item.label)}>
            {renderItems(item.items)}
          </Group>
        );
      }

      return (
        <Item
          key={item.label}
          to={item.to}
          icon={item.icon || null}
          label={t(item.label)}
        />
      );
    }, items);
  };
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <img src="/logo.png" className="size-8" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">18xx Maker</span>
                  <span className="">
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://github.com/18xx-maker/18xx-maker/releases/tag/v${version}`}
                    >
                      {version}
                    </a>
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>{renderItems(mainMenu)}</SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
