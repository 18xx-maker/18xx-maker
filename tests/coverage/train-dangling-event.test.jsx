import { describe, expect, it } from "vitest";

import Train from "@/components/cards/Train";

import { all, mountElement } from "@tests/support/render.jsx";

// A train renamed elsewhere leaves events that name a train which is gone
describe("Train events naming a missing train", () => {
  const trains = [
    { name: "2", color: "yellow" },
    { name: "3", color: "green" },
  ];

  const notes = async (train) => {
    const { root } = await mountElement(
      <Train train={train} trains={trains} />,
    );
    return all(root, ".train__info").map((n) => n.textContent);
  };

  it.for([
    ["rust", "Rusted by"],
    ["phased", "Phased out by"],
    ["obsolete", "Obsoleted by"],
  ])("renders the %s note for a string", async ([key, text]) => {
    expect(await notes({ name: "2", [key]: "4D" })).toEqual([`${text} 4D`]);
  });

  it.for([
    ["rust", "Rusted by"],
    ["phased", "Phased out by"],
    ["obsolete", "Obsoleted by"],
  ])("renders the %s note for an index form", async ([key, text]) => {
    expect(await notes({ name: "2", [key]: { index: 2, on: "4D" } })).toEqual([
      `${text} 2nd 4D`,
    ]);
  });

  it.for([
    ["rust", "Rusted by"],
    ["phased", "Phased out by"],
    ["obsolete", "Obsoleted by"],
  ])(
    "renders the %s note when only a later event is missing",
    async ([key, text]) => {
      expect(await notes({ name: "2", [key]: ["3", "4D"] })).toEqual([
        `${text} 3, 4D`,
      ]);
    },
  );
});
