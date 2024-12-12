import { useTranslation } from "react-i18next";

import { addIndex, chain } from "ramda";

import { ArrowBigRight, Settings } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { mainMenu } from "@/components/nav";
import Group from "@/components/nav/sidebar/Group";
import Item from "@/components/nav/sidebar/Item";

import { useLoadedGame } from "@/hooks";
import version from "@/util/version";

const AppSidebar = (props) => {
  const { t } = useTranslation();
  const game = useLoadedGame();

  const renderItems = (items) => {
    return addIndex(chain)((item, index) => {
      if (item.game) {
        return (
          game && [
            <Item
              key={game.slug}
              to={`/games/${game.slug}`}
              icon={item.icon || null}
              label={game.title}
            />,
            <Item
              key="game-editor"
              to={`/games/${game.slug}/map`}
              icon={ArrowBigRight}
              label={t("nav.edit")}
            />,
          ]
        );
      }

      if (item.sep) {
        return [<Separator key={`sep-${index}`} />];
      }

      if (item.items) {
        return [
          <Group key={item.label || `group-${index}`} label={t(item.label)}>
            {renderItems(item.items)}
          </Group>,
        ];
      }

      return [
        <Item
          key={item.label}
          to={item.to}
          icon={item.icon || null}
          label={t(item.label)}
        />,
      ];
    }, items);
  };
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
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
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>{renderItems(mainMenu)}</SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <Item to="/settings" label={t("settings.title")} icon={Settings} />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
