import { unzipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { zipFiles } from "./zipFiles.js";

const enc = (s) => new TextEncoder().encode(s);

const files = [
  { path: "svg/a.svg", bytes: enc("<svg>a</svg>") },
  { path: "svg/b.svg", bytes: enc("<svg>b</svg>") },
];

describe("zipFiles", () => {
  it("zips files under their paths", () => {
    const out = unzipSync(zipFiles(files));
    expect(Object.keys(out)).toEqual(["svg/a.svg", "svg/b.svg"]);
    expect(out["svg/a.svg"]).toEqual(files[0].bytes);
    expect(out["svg/b.svg"]).toEqual(files[1].bytes);
  });

  it("same input, same bytes", () => {
    expect(zipFiles(files)).toEqual(zipFiles(files));
  });
});
