import { describe, expect, it } from "vitest";

import Phase from "@/components/Phase";
import Train from "@/components/cards/Train";

import { games } from "@/data";

import { mountElement } from "@tests/support/render.jsx";

const game = games["18Test"];
const text = (root, selector) =>
  [...root.querySelectorAll(selector)].map((e) => e.textContent.trim());

describe("train format strings", () => {
  const train = { name: "3+1", color: "green", price: 300 };

  it("formats the price, upgrade and trade in of a train card", async () => {
    const { root } = await mountElement(
      <Train
        train={{
          ...train,
          priceFormat: "#G",
          upgrade: 200,
          upgradeFormat: "+#",
          tradeIn: 100,
          tradeInFormat: "-# trade",
        }}
        trains={[]}
      />,
    );
    expect(text(root, ".train__price")[0]).toContain("300G");
    expect(text(root, ".train__upgrade_price")[0]).toBe("→ +200");
    expect(text(root, ".train__trade_in_price")[0]).toBe("(-100 trade)");
  });

  it("keeps the game currency without a format", async () => {
    const { root } = await mountElement(
      <Train train={{ ...train, upgrade: 200 }} trains={[]} />,
    );
    expect(text(root, ".train__price")[0]).toContain("$300");
    expect(text(root, ".train__upgrade_price")[0]).toBe("→ $200");
  });

  it("formats the price in the phase table", async () => {
    const { root } = await mountElement(
      <Phase
        phases={[
          { name: "1", train: "2", tiles: "yellow" },
          { name: "2", train: "3", tiles: "green" },
        ]}
        trains={[
          { name: "2", price: 80, priceFormat: "#G" },
          { name: "3", price: 180 },
        ]}
      />,
      { game },
    );
    expect(text(root, "tbody tr:nth-child(1) td:nth-child(3)")[0]).toBe("80G");
    expect(text(root, "tbody tr:nth-child(2) td:nth-child(3)")[0]).toBe("$180");
  });
});
