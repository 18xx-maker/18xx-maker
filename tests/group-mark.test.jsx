import { describe, expect, it } from "vitest";

import Charter from "@/components/Charter";
import GroupMark from "@/components/atoms/GroupMark";
import Private from "@/components/cards/Private";
import Share from "@/components/cards/Share";

import { games } from "@/data";

import { all, mountElement, one } from "@tests/support/render.jsx";

const game = games["18Test"];
const company = (abbrev) => game.companies.find((c) => c.abbrev === abbrev);
const charterProps = {
  name: "Blue Railroad",
  color: "blue",
  tokens: [],
  trains: [],
  phases: [{ name: "2" }],
  turns: [],
};
const marks = (root) => all(root, "[data-testid^=group-mark-]");

describe("GroupMark", () => {
  it("draws nothing for no group or an unknown group", async () => {
    const { root } = await mountElement(
      <>
        <GroupMark />
        <GroupMark group="nope" />
      </>,
    );
    expect(root).toBeEmptyDOMElement();
  });

  it("draws the shape of the group, outline only without a color", async () => {
    const { root } = await mountElement(<GroupMark group="outline" />);
    expect(one(root, "polygon, path")).toHaveAttribute("fill", "none");
    const { root: filled } = await mountElement(<GroupMark group="orange" />);
    expect(one(filled, "circle").getAttribute("fill")).not.toBe("none");
  });

  it("draws the text of the group in a contrasting color", async () => {
    const { root } = await mountElement(<GroupMark group="dark" />);
    expect(one(root, "text")).toHaveTextContent("G");
    expect(one(root, "text")).toHaveAttribute("fill", "#fff");
  });

  it("fills the same on a private, a charter and a share", async () => {
    const fills = [];
    for (const element of [
      <Private key="p" name="P" price={1} group="orange" />,
      <Charter key="c" {...charterProps} company={company("BRR")} />,
      <Share
        key="s"
        company={company("BRR")}
        president
        shares={1}
        color="blue"
        name="Blue"
      />,
    ]) {
      const { root } = await mountElement(element);
      fills.push(
        one(root, "[data-testid=group-mark-orange] circle").getAttribute(
          "fill",
        ),
      );
    }
    expect(new Set(fills).size).toBe(1);
  });
});

describe("group marks on the print pieces", () => {
  it("prints the mark on a private with a group only", async () => {
    const grouped = await mountElement(<Private name="P" group="blue" />);
    expect(marks(grouped.root)).toHaveLength(1);
    const plain = await mountElement(<Private name="P" />);
    expect(marks(plain.root)).toHaveLength(0);
    const unknown = await mountElement(<Private name="P" group="nope" />);
    expect(marks(unknown.root)).toHaveLength(0);
  });

  it("prints the mark on the charter and marks it", async () => {
    const { root } = await mountElement(
      <Charter {...charterProps} company={company("BRR")} />,
    );
    expect(marks(root)).toHaveLength(1);
    expect(one(root, ".charter").className).toContain("charter--group");
  });

  it("prints nothing on a charter without a group", async () => {
    const { root } = await mountElement(
      <Charter {...charterProps} company={company("PRR")} />,
    );
    expect(marks(root)).toHaveLength(0);
    expect(one(root, ".charter").className).not.toContain("charter--group");
  });

  it("prints the mark on a half width charter", async () => {
    const { root } = await mountElement(
      <Charter {...charterProps} halfWidth company={company("NVRR")} />,
    );
    expect(marks(root)).toHaveLength(1);
  });

  it.each(["center", "left", "gmt"])(
    "prints the mark on the president's share only (%s)",
    async (style) => {
      const search = `?config.cards.shareStyle=${style}`;
      const president = await mountElement(
        <Share company={company("BRR")} president shares={2} color="blue" />,
        { search },
      );
      expect(marks(president.root)).toHaveLength(1);
      const other = await mountElement(
        <Share company={company("BRR")} shares={1} color="blue" />,
        { search },
      );
      expect(marks(other.root)).toHaveLength(0);
    },
  );
});
