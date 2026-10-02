// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";

import useLocalState from "@/util/useLocalState";
import useSessionState from "@/util/useSessionState";

describe.each([
  ["useLocalState", useLocalState, () => localStorage],
  ["useSessionState", useSessionState, () => sessionStorage],
])("%s", (_name, useState, getStorage) => {
  afterEach(() => {
    getStorage().clear();
    vi.restoreAllMocks();
  });

  it("starts with the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useState("key", { a: 1 }));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it("starts with the stored value", () => {
    getStorage().setItem("key", '{"a":2}');
    const { result } = renderHook(() => useState("key", { a: 1 }));
    expect(result.current[0]).toEqual({ a: 2 });
  });

  it("falls back to the initial value when the stored value is invalid", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    getStorage().setItem("key", "{");

    const { result } = renderHook(() => useState("key", "initial"));
    expect(result.current[0]).toBe("initial");
    expect(error).toHaveBeenCalledWith(expect.any(SyntaxError));
  });

  it("stores new values", () => {
    const { result } = renderHook(() => useState("key", 0));
    act(() => result.current[1]([1, 2]));

    expect(result.current[0]).toEqual([1, 2]);
    expect(getStorage().getItem("key")).toBe("[1,2]");
  });

  it("keeps the new value when storage fails", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const failure = new Error("full");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw failure;
    });

    const { result } = renderHook(() => useState("key", 0));
    act(() => result.current[1](5));

    expect(result.current[0]).toBe(5);
    expect(log).toHaveBeenCalledWith(failure);
  });
});
