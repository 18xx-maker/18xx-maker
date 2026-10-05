/* eslint-disable testing-library/no-node-access, testing-library/no-container, jest-dom/prefer-to-have-text-content -- tokens are bare spans */
import { render, screen } from "@testing-library/react";

import Code from "@/components/docs/Code";

const tokens = (container) =>
  [...container.querySelectorAll(".shiki code span span")].map((span) => ({
    light: span.style.getPropertyValue("--shiki-light"),
    dark: span.style.getPropertyValue("--shiki-dark"),
    text: span.textContent,
  }));

describe("Code", () => {
  it("splits json into tokens with a color for each theme", () => {
    const { container } = render(
      <Code language="json">{'{\n  "a": 1\n}'}</Code>,
    );
    const found = tokens(container);
    expect(found.map((token) => token.text).join("")).toBe('{  "a": 1}');
    const key = found.find((token) => token.text === '"a"');
    const brace = found.find((token) => token.text === "{");
    expect(key.light).toMatch(/^#/);
    expect(key.dark).toMatch(/^#/);
    expect(key.light).not.toBe(brace.light);
    expect(container.querySelector("code")).toHaveTextContent(
      /^\{\s+"a": 1\s+\}$/,
    );
    expect(container.querySelector("code").textContent).toBe('{\n  "a": 1\n}');
  });

  it("highlights bash", () => {
    const { container } = render(
      <Code language="bash">{"echo 'hi' # note"}</Code>,
    );
    const found = tokens(container);
    expect(found.length).toBeGreaterThan(2);
    expect(new Set(found.map((token) => token.light)).size).toBeGreaterThan(1);
  });

  it("renders unknown languages as plain text", () => {
    const { container } = render(
      <Code language="klingon">{"line one\n\nline three"}</Code>,
    );
    expect(container.querySelector("code").textContent).toBe(
      "line one\n\nline three",
    );
    expect(container.querySelector("[style*='--shiki']")).toBeNull();
  });

  it("passes the class name to the block", () => {
    const { container } = render(
      <Code language="json" className="rounded-lg w-full">
        {"{}"}
      </Code>,
    );
    expect(container.querySelector(".shiki")).toHaveClass(
      "rounded-lg",
      "w-full",
    );
  });

  it("never injects the code as HTML", () => {
    const { container } = render(
      <Code language="json">{'["<img src=x onerror=alert(1)>"]'}</Code>,
    );
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("code").textContent).toBe(
      '["<img src=x onerror=alert(1)>"]',
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
