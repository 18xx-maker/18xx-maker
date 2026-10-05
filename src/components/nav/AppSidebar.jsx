import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { addIndex, chain, prop } from "ramda";

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
import DownloadItem from "@/components/nav/sidebar/DownloadItem";
import ExportItem from "@/components/nav/sidebar/ExportItem";
import Group from "@/components/nav/sidebar/Group";
import Item from "@/components/nav/sidebar/Item";
import ProblemsItem from "@/components/nav/sidebar/ProblemsItem";
import UpdateItem from "@/components/nav/sidebar/UpdateItem";

import { useLoadedGame } from "@/hooks";
import { selectGameProblems } from "@/state";
import { selectGameForSlug } from "@/state/selectors";
import capability from "@/util/capability";
import version from "@/util/version";

const AppSidebar = (props) => {
  const { t } = useTranslation();
  const game = useLoadedGame();
  const update = useSelector(prop("update"));
  // The export menu needs the game itself, not only its entry in the store
  const resolved = useSelector((state) => selectGameForSlug(state, game?.slug));

  const issues = useSelector((state) => selectGameProblems(state, game?.slug));
  // A check that could not run is not a problem of the game
  const problems = issues?.filter((issue) => issue.code !== "failed");

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
            resolved && <DownloadItem key="game-download" game={resolved} />,
            capability.electron && resolved && <ExportItem key="game-export" />,
            resolved && problems?.length > 0 && (
              <ProblemsItem
                key="game-problems"
                slug={game.slug}
                count={problems.length}
              />
            ),
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
            <UpdateItem version={update.info?.version} />
          )}
          <Item to="/settings" label={t("settings.title")} icon={Settings} />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
