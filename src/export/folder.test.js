import { savedFolder } from "#export/folder";

describe("savedFolder", () => {
  it("is the saved folder when it is still a folder", () => {
    expect(savedFolder("/out", () => true)).toBe("/out");
  });

  it("is nothing when the folder is gone, a file, or was never saved", () => {
    expect(savedFolder("/out", () => false)).toBeUndefined();
    expect(savedFolder(undefined, () => true)).toBeUndefined();
    expect(savedFolder("", () => true)).toBeUndefined();
    expect(savedFolder(42, () => true)).toBeUndefined();
  });
});
