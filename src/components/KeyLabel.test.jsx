/* eslint-disable testing-library/no-node-access, testing-library/no-container, jest-dom/prefer-to-have-text-content -- the underline is a bare <u> with no role */
import { render, screen } from "@testing-library/react";

import KeyLabel from "@/components/KeyLabel";

const underlined = (container) =>
  [...container.querySelectorAll("u")].map((u) => u.textContent);

describe("KeyLabel", () => {
  it("underlines the key in the label", () => {
    const { container } = render(<KeyLabel text="Home" shortcut="h" />);
    expect(underlined(container)).toEqual(["H"]);
    expect(container).toHaveTextContent("Home");
  });

  it("underlines inside the given word", () => {
    const { container } = render(
      <KeyLabel text="Export game as pdf documents" shortcut="p" word="pdf" />,
    );
    expect(container.querySelector("u").previousSibling.textContent).toBe(
      "Export game as ",
    );
    expect(underlined(container)).toEqual(["p"]);
  });

  it("appends a hidden key when the label has no such letter", () => {
    const { container } = render(<KeyLabel text="Logos" shortcut="c" />);
    expect(underlined(container)).toEqual(["c"]);
    expect(container.querySelector("[aria-hidden]")).toHaveTextContent("(c)");
  });

  it("appends the key when asked, even if the letter is in the label", () => {
    const { container } = render(<KeyLabel text="Tango" shortcut="t" append />);
    expect(container.querySelector("[aria-hidden]")).toHaveTextContent("(t)");
  });

  it("finds the word regardless of case", () => {
    const { container } = render(
      <KeyLabel text="Spiel als PDF-Dokumente" shortcut="p" word="pdf" />,
    );
    expect(underlined(container)).toEqual(["P"]);
    expect(container.querySelector("[aria-hidden]")).toBeNull();
  });

  it("falls back to the suffix when the word is not in the label", () => {
    const { container } = render(
      <KeyLabel text="Dokumente" shortcut="p" word="pdf" />,
    );
    expect(container.querySelector("[aria-hidden]")).toHaveTextContent("(p)");
    screen.getByText(/Dokumente/);
  });
});
