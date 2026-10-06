import { describe, expect, it } from "vitest";

import { charterSubtitle } from "./charterSubtitle";

describe("charterSubtitle", () => {
  it("is null without fields", () => {
    expect(charterSubtitle({})).toBeNull();
    expect(charterSubtitle(undefined)).toBeNull();
  });

  it("uses the defaults of each slot", () => {
    expect(
      charterSubtitle({ home: "A1", destination: "B2", ability: "Free tile" }),
    ).toEqual({ left: "Home: A1", middle: "Dest: B2", right: "Free tile" });
  });

  it("joins a list of homes and keeps missing slots empty", () => {
    expect(charterSubtitle({ home: ["A1", "B2"] })).toEqual({
      left: "Home: A1 / B2",
      middle: "",
      right: "",
    });
  });

  it("overrides and blanks slots", () => {
    expect(
      charterSubtitle({
        home: "A1",
        destination: "B2",
        charterSubtitle: { left: "Starts in A1", middle: "" },
      }),
    ).toEqual({ left: "Starts in A1", middle: "", right: "" });
  });

  it("is null when every slot is blank", () => {
    expect(
      charterSubtitle({ home: "A1", charterSubtitle: { left: "" } }),
    ).toBeNull();
  });

  it("prints an override without the fields", () => {
    expect(charterSubtitle({ charterSubtitle: { right: "Hi" } })).toEqual({
      left: "",
      middle: "",
      right: "Hi",
    });
  });
});
