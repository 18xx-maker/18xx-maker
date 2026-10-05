/* eslint-disable testing-library/no-node-access */
import { screen, waitFor } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

const cardFor = (page, name) =>
  [...page.querySelectorAll(".checkered")].find((card) =>
    card.textContent.includes(name),
  );

describe("elements logos page", () => {
  it.each(["1846/ERIE", "1846/GT"])(
    "shows the normal and reserved sides of %s",
    async (name) => {
      renderApp("/elements/logos?group=1846");
      const page = await screen.findByTestId("logos");

      await waitFor(() => {
        expect(cardFor(page, name)).toBeDefined();
      });

      const card = cardFor(page, name);

      expect(card.querySelectorAll("svg")).toHaveLength(2);

      expect(card).toHaveTextContent("Normal");
      expect(card).toHaveTextContent("Reserved");
      const reserved = card.querySelector("svg.color-reserved");
      expect(reserved).not.toBeNull();
      // the reserved side recolors yellow to gray, the front keeps yellow

      if (name !== "1846/ERIE") {
        return;
      }
      const front = card.querySelector("svg:not(.color-reserved)");
      const fill = (svg) =>
        getComputedStyle(svg.querySelector(".color-yellow")).fill;
      expect(fill(reserved)).not.toBe(fill(front));
    },
  );
});
