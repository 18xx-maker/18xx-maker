import { useLocation, useMatch } from "react-router";

import { assoc, chain, pick, prop, reduce } from "ramda";

import { Settings } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { mainMenu } from "@/components/nav";
import HeaderGame from "@/components/nav/HeaderGame";
import HeaderTitle from "@/components/nav/HeaderTitle";

const collectPages = chain((item) => {
  if (item.sep) {
    return [];
  }

  if (item.items) {
    return collectPages(item.items);
  }

  return item;
});
const pages = reduce(
  (acc, page) => assoc(prop("to", page), pick(["icon", "label"], page), acc),
  {},
  collectPages(mainMenu),
);

const Header = () => {
  const { pathname } = useLocation();
  const match = useMatch("/games/:slug");

  const page =
    pathname === "/settings"
      ? { icon: Settings, label: "settings.title" }
      : pages[pathname];

  const titleNode = match ? (
    <HeaderGame />
  ) : (
    <HeaderTitle Icon={page && page.icon} label={page && page.label} />
  );

  return (
    <header className="md:hidden sticky bg-background inset-0 z-10 flex h-16 shrink-0 border-b items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {titleNode}
      </div>
    </header>
  );
};
export default Header;
