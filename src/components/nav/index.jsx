import {
  Atom,
  Building2,
  Chrome,
  Coins,
  Cylinder,
  FileStack,
  FolderOpen,
  Globe,
  Hexagon,
  House,
  Image,
  Info,
  Move,
  Package,
  Scissors,
  ScrollText,
  Shield,
  SquareDashed,
  SwatchBook,
  TrainFront,
} from "lucide-react";

export const mainMenu = [
  {
    items: [
      {
        icon: House,
        label: "nav.home",
        to: "/",
      },
      {
        icon: FolderOpen,
        label: "nav.load",
        to: "/games",
      },
    ],
  },
  {
    label: "nav.elements",
    items: [
      {
        icon: Atom,
        label: "elements.atoms.title",
        to: "/elements",
      },
      {
        icon: Hexagon,
        label: "elements.tiles.title",
        to: "/elements/tiles",
      },
      {
        icon: Shield,
        label: "elements.logos.title",
        to: "/elements/logos",
      },
    ],
  },
  {
    label: "nav.docs",
    items: [
      {
        icon: Info,
        label: "docs.help.title",
        to: "/docs",
      },
      {
        icon: FileStack,
        label: "docs.files.title",
        to: "/docs/files",
      },
      {
        icon: Globe,
        label: "docs.translation.title",
        to: "/docs/translation",
      },
      { sep: true },
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
        icon: Package,
        label: "docs.output.b18.title",
        to: "/docs/output/b18",
      },
      { sep: true },
      {
        icon: SwatchBook,
        label: "docs.games.schemas.title",
        to: "/docs/games/schemas",
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
        icon: TrainFront,
        label: "docs.games.trains.title",
        to: "/docs/games/trains",
      },
      {
        icon: Building2,
        label: "docs.games.logos.title",
        to: "/docs/games/logos",
      },
      {
        icon: Chrome,
        label: "docs.games.overrides.title",
        to: "/docs/games/overrides",
      },
      {
        icon: Move,
        label: "docs.games.positioning.title",
        to: "/docs/games/positioning",
      },
      { sep: true },
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
