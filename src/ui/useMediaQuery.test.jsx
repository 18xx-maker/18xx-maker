import { act, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import useMediaQuery from "./useMediaQuery";

const Probe = ({ query, fallback }) => (
  <p>{String(useMediaQuery(query, fallback))}</p>
);

describe("useMediaQuery", () => {
  afterEach(() => vi.restoreAllMocks());

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
    vi.unstubAllGlobals();
  });
});
