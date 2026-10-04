import { screen, waitFor } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

const cardFor = (page, name) =>
  // eslint-disable-next-line testing-library/no-node-access
  [...page.querySelectorAll(".checkered")].find((card) =>
    card.textContent.includes(name),
  );

describe("elements logos page", () => {
  it("shows the reserved back of a recolorable logo", async () => {
    renderApp("/elements/logos?group=1846");
    const page = await screen.findByTestId("logos");

    await waitFor(() => {
      // eslint-disable-next-line testing-library/no-node-access
      expect(cardFor(page, "1846/ERIE").querySelectorAll("svg")).toHaveLength(
        2,
      );
    });

    const card = cardFor(page, "1846/ERIE");
    // eslint-disable-next-line testing-library/no-node-access
    expect(card.querySelector("svg.color-reserved")).not.toBeNull();
  });

  it("shows a single side for a logo without color classes", async () => {
    renderApp("/elements/logos?group=1846");
    const page = await screen.findByTestId("logos");

    await waitFor(() => {
      // eslint-disable-next-line testing-library/no-node-access
      expect(cardFor(page, "1846/ERIE").querySelectorAll("svg")).toHaveLength(
        2,
      );
    });

    const card = cardFor(page, "1846/GT");
    // eslint-disable-next-line testing-library/no-node-access
    expect(card.querySelectorAll("svg")).toHaveLength(1);
    // eslint-disable-next-line testing-library/no-node-access
    expect(card.querySelector("svg.color-reserved")).toBeNull();
    expect(card).not.toHaveTextContent("Reserved");
  });
});
