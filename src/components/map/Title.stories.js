import { createElement as h } from "react";

import Title from "@/components/map/Title";

import { useGame } from "@/hooks";

const MapTitle = ({ title, subtitle, designer, ...props }) => {
  const game = useGame();

  return h(Title, {
    ...props,
    game: { ...game, info: { ...game.info, title, subtitle, designer } },
  });
};

export default {
  title: "Map/Title",
  component: Title,
  render: (args) => h(MapTitle, args),
  parameters: {
    layout: "centered",
    game: "18Test",
    svg: { width: 800, height: 400, viewBox: "0 0 1200 600" },
  },
  args: {
    title: "18Test",
    subtitle: "18xx-Maker Test File",
    designer: "Christopher Giroir",
    hexWidth: 150,
  },
  argTypes: {
    title: { control: { type: "text" } },
    subtitle: { control: { type: "text" } },
    designer: { control: { type: "text" } },
    hexWidth: { control: { type: "range", min: 50, max: 150, step: 10 } },
  },
};

export const Standard = {};

export const NoSubtitle = { args: { subtitle: "" } };
