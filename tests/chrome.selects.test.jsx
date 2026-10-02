import { screen, waitFor } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

// Selects outside the config drawer: the tile filters (a filled Select with a
// label) and the group pickers (an outlined Select with no label). The popup
// is closed while aria-expanded is false (Base UI keeps its hidden listbox).
const open = { hidden: false };

describe("selects on the elements pages", () => {
  it("filters tiles by color and by what they include", async () => {
    const { user, router } = renderApp("/elements/tiles");
    await screen.findByTestId("tiles");

    const color = screen.getByRole("combobox", { name: /^Color/ });
    expect(color).toHaveTextContent("All");
    await user.click(color);
    await user.click(
      await screen.findByRole("option", { name: "yellow", ...open }),
    );
    await waitFor(() =>
      expect(router.state.location.search).toContain("color=yellow"),
    );
    expect(color).toHaveTextContent("yellow");

    const includes = screen.getByRole("combobox", { name: /^Includes/ });
    await user.click(includes);
    await user.click(
      await screen.findByRole("option", { name: "Town", ...open }),
    );
    await waitFor(() =>
      expect(router.state.location.search).toContain("includes=town"),
    );
    expect(includes).toHaveTextContent("Town");
  });

  it("picks the group to show on the atoms and logos pages", async () => {
    const { user, router } = renderApp("/elements");
    await screen.findByTestId("atoms");

    // The closed config drawer has comboboxes too
    const group = screen.getByRole("combobox", open);
    expect(group).toHaveTextContent("Hexes");
    await user.click(group);
    const options = await screen.findAllByRole("option", open);
    const other = options.find((option) => option.textContent !== "Hexes");
    await user.click(other);
    await waitFor(() =>
      expect(router.state.location.search).toContain("group="),
    );
    expect(group).toHaveTextContent(other.textContent);
  });
});
