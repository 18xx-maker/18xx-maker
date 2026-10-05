import { act, renderHook } from "@testing-library/react";

import { usePrefersDark } from "@/hooks/usePrefersDark";

// A media query list whose result the test changes
const mockMedia = (matches) => {
  const media = {
    matches,
    listeners: new Set(),
    addEventListener: vi.fn((_type, listener) => media.listeners.add(listener)),
    removeEventListener: vi.fn((_type, listener) =>
      media.listeners.delete(listener),
    ),
  };
  vi.spyOn(window, "matchMedia").mockImplementation(() => media);
  return media;
};

afterEach(() => vi.restoreAllMocks());

describe("usePrefersDark", () => {
  it("follows a change of the system color scheme", () => {
    const media = mockMedia(false);
    const { result } = renderHook(() => usePrefersDark());
    expect(result.current).toBe(false);

    act(() => {
      media.matches = true;
      media.listeners.forEach((listener) => listener());
    });
    expect(result.current).toBe(true);
  });

  it("stops listening when unmounted", () => {
    const media = mockMedia(true);
    const { result, unmount } = renderHook(() => usePrefersDark());
    expect(result.current).toBe(true);
    expect(media.listeners.size).toBe(1);

    unmount();
    expect(media.listeners.size).toBe(0);
    expect(media.removeEventListener).toHaveBeenCalledTimes(1);
  });
});
