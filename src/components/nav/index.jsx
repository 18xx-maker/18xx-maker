import {
  Atom,
  BookOpenText,
  ChartNoAxesCombined,
  CircleHelp,
  Coins,
  Crosshair,
  Cylinder,
  FilePlus,
  FileStack,
  FolderOpen,
  Globe,
  HandCoins,
  Hexagon,
  House,
  Image,
  Info,
  Layers,
  LayoutDashboard,
  MonitorDown,
  Package,
  Palette,
  Scissors,
  ScrollText,
  Settings2,
  Shapes,
  Shield,
  SlidersHorizontal,
  SquareDashed,
  SquareTerminal,
  SwatchBook,
  TrainFront,
  TrainTrack,
} from "lucide-react";

export const mainMenu = [
  {
    items: [
      {
        icon: House,
        label: "nav.home",
        shortcut: "h",
        to: "/",
      },
      {
        icon: FolderOpen,
        label: "nav.load",
        shortcut: "l",
        to: "/games",
      },
      {
        icon: TrainTrack,
        game: true,
        shortcut: "g",
      },
    ],
  },
  {
    label: "nav.elements",
    items: [
      {
        icon: Atom,
        label: "elements.atoms.title",
        shortcut: "a",
        to: "/elements",
      },
      {
        icon: Hexagon,
        label: "elements.tiles.title",
        shortcut: "t",
        to: "/elements/tiles",
      },
      {
        icon: Shield,
        label: "elements.logos.title",
        shortcut: "c",
        to: "/elements/logos",
      },
      {
        icon: Crosshair,
        shortcut: "p",
        label: "elements.positioning.title",
        to: "/elements/positioning",
      },
    ],
  },
  {
    label: "nav.docsStart",
    items: [
      {
        icon: Info,
        label: "docs.help.title",
        shortcut: "m",
        to: "/docs",
      },
      {
        icon: FileStack,
        label: "docs.files.title",
        to: "/docs/files",
      },
      {
        icon: SlidersHorizontal,
        label: "docs.config.title",
        to: "/docs/config",
      },
      {
        icon: MonitorDown,
        label: "docs.app.title",
        to: "/docs/app",
      },
      {
        icon: CircleHelp,
        label: "docs.faq.title",
        to: "/docs/faq",
      },
      {
        icon: Globe,
        label: "docs.translation.title",
        to: "/docs/translation",
      },
    ],
  },
  {
    label: "nav.docsOutput",
    items: [
      {
        icon: SquareTerminal,
        label: "docs.output.cli.title",
        to: "/docs/output/cli",
      },
      {
        icon: ScrollText,
        label: "docs.output.pdf.title",
        to: "/docs/output/pdf",
      },
      {
        icon: Image,
        label: "docs.output.png.title",
        to: "/docs/output/png",
      },
      {
        icon: Shapes,
        label: "docs.output.svg.title",
        to: "/docs/output/svg",
      },
      {
        icon: Package,
        label: "docs.output.b18.title",
        to: "/docs/output/b18",
      },
    ],
  },
  {
    label: "nav.docsGames",
    items: [
      {
        icon: FilePlus,
        label: "docs.games.firstGame.title",
        to: "/docs/games/first-game",
      },
      {
        icon: LayoutDashboard,
        label: "docs.games.pages.title",
        to: "/docs/games/pages",
      },
      {
        icon: SwatchBook,
        label: "docs.games.schemas.title",
        to: "/docs/games/schemas",
      },
      {
        icon: Palette,
        label: "docs.games.themes.title",
        to: "/docs/games/themes",
      },
      {
        icon: SquareDashed,
        label: "docs.games.borders.title",
        to: "/docs/games/borders",
      },
      {
        icon: Coins,
        label: "docs.games.types.title",
        to: "/docs/games/types",
      },
      {
        icon: ChartNoAxesCombined,
        label: "docs.games.market.title",
        to: "/docs/games/market",
      },
      {
        icon: Hexagon,
        label: "docs.games.tiles.title",
        to: "/docs/games/tiles",
      },
      {
        icon: HandCoins,
        label: "docs.games.privates.title",
        to: "/docs/games/privates",
      },
      {
        icon: BookOpenText,
        label: "docs.games.gameInfo.title",
        to: "/docs/games/game-info",
      },
      {
        icon: TrainFront,
        label: "docs.games.trains.title",
        to: "/docs/games/trains",
      },
      {
        icon: Shield,
        label: "docs.games.logos.title",
        to: "/docs/games/logos",
      },
      {
        icon: Layers,
        label: "docs.games.overrides.title",
        to: "/docs/games/overrides",
      },
      {
        icon: Crosshair,
        label: "docs.games.positioning.title",
        to: "/docs/games/positioning",
      },
      {
        icon: Settings2,
        label: "docs.games.exports.title",
        to: "/docs/games/exports",
      },
    ],
  },
  {
    label: "nav.docsPnp",
    items: [
      {
        icon: Cylinder,
        label: "docs.pnp.tokens.title",
        to: "/docs/pnp/tokens",
      },
      {
        icon: Scissors,
        label: "docs.pnp.die.title",
        to: "/docs/pnp/die",
      },
    ],
  },
];

// The docs pages in the order of the sidebar, for the previous and next links
export const docsPages = mainMenu
  .flatMap((group) => group.items)
  .filter((item) => item.to?.startsWith("/docs"));
