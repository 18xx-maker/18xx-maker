import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { addIndex, chain, prop } from "ramda";

import { ArrowBigRight, Download, Settings } from "lucide-react";

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
import ExportItem from "@/components/nav/sidebar/ExportItem";
import Group from "@/components/nav/sidebar/Group";
import Item from "@/components/nav/sidebar/Item";

import { useLoadedGame } from "@/hooks";
import { selectGameForSlug } from "@/state/selectors";
import capability from "@/util/capability";
import version from "@/util/version";

const AppSidebar = (props) => {
  const { t } = useTranslation();
  const game = useLoadedGame();
  const update = useSelector(prop("update"));
  // The export menu needs the game itself, not only its entry in the store
  const resolved = useSelector((state) => selectGameForSlug(state, game?.slug));

  const renderItems = (items) => {
    return addIndex(chain)((item, index) => {
      if (item.game) {
        return (
          game &&
          [
            <Item
              key={game.slug}
              to={`/games/${game.slug}`}
              icon={item.icon || null}
              label={game.title}
              shortcut={item.shortcut}
              append
            />,
            <Item
              key="game-editor"
              to={`/games/${game.slug}/map`}
              icon={ArrowBigRight}
              label={t("nav.edit")}
              shortcut="e"
            />,
            capability.electron && resolved && <ExportItem key="game-export" />,
          ].filter(Boolean)
        );
      }

      if (item.sep) {
        return [<Separator key={`sep-${index}`} aria-hidden="true" />];
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
          shortcut={item.shortcut}
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
                <img
                  src={`${import.meta.env.BASE_URL}logo.png`}
                  alt=""
                  className="size-8"
                />
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
          {update && update.available && (
            <Item to="/app" label={t("nav.update")} icon={Download} />
          )}
          <Item to="/settings" label={t("settings.title")} icon={Settings} />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
