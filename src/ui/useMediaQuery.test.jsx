import { act, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import useMediaQuery from "./useMediaQuery";

const Probe = ({ query, fallback }) => (
  <p>{String(useMediaQuery(query, fallback))}</p>
);

describe("useMediaQuery", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("reads the real viewport", () => {
    render(
      <>
        <Probe query="(min-width:0px)" />
        <Probe query="(max-width:0px)" />
      </>,
    );
    expect(screen.getAllByText("true")).toHaveLength(1);
    expect(screen.getAllByText("false")).toHaveLength(1);
  });

  it("updates when the query changes", () => {
    let matches = false;
    let notify;
    vi.spyOn(window, "matchMedia").mockImplementation(() => ({
      get matches() {
        return matches;
      },
      addEventListener: (_, cb) => {
        notify = cb;
      },
      removeEventListener: () => {},
    }));

    render(<Probe query="(min-width:960px)" />);
    expect(screen.getByText("false")).toBeInTheDocument();

    matches = true;
    act(() => notify());
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("returns the default when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    render(<Probe query="(min-width:0px)" fallback />);
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("accepts a leading @media like MUI", () => {
    render(
      <>
        <Probe query="@media (min-width:0px)" />
        <Probe query="@media(max-width:0px)" />
      </>,
    );
    expect(screen.getAllByText("true")).toHaveLength(1);
    expect(screen.getAllByText("false")).toHaveLength(1);
  });

  it("removes the listener on unmount and when the query changes", () => {
    const added = [];
    const removed = [];
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: false,
      addEventListener: (_, cb) => added.push([query, cb]),
      removeEventListener: (_, cb) => removed.push([query, cb]),
    }));

    const { rerender, unmount } = render(<Probe query="(min-width:600px)" />);
    expect(added).toHaveLength(1);
    expect(removed).toHaveLength(0);

    rerender(<Probe query="(min-width:960px)" />);
    expect(added).toHaveLength(2);
    expect(removed).toEqual([added[0]]);

    unmount();
    expect(removed).toEqual([added[0], added[1]]);
  });
});
