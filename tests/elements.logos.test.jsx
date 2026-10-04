import { screen, waitFor } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

const cardFor = (page, name) =>
  // eslint-disable-next-line testing-library/no-node-access
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
      // eslint-disable-next-line testing-library/no-node-access
      expect(card.querySelectorAll("svg")).toHaveLength(2);
      // eslint-disable-next-line testing-library/no-node-access
      expect(card.querySelector("svg.color-reserved")).not.toBeNull();
      expect(card).toHaveTextContent("Normal");
      expect(card).toHaveTextContent("Reserved");
    },
  );
});
