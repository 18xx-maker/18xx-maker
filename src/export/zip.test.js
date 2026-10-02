import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { b18Names } from "#export/names";
import { writeZip } from "#export/zip";

// The names of the files in a zip, from its central directory
const entries = (file) => {
  const zip = fs.readFileSync(file);
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = zip.readUInt16LE(end + 10);
  const names = [];
  for (let at = zip.readUInt32LE(end + 16), i = 0; i < count; i++) {
    const nameLength = zip.readUInt16LE(at + 28);
    const extraLength = zip.readUInt16LE(at + 30);
    const commentLength = zip.readUInt16LE(at + 32);
    names.push(zip.toString("utf-8", at + 46, at + 46 + nameLength));
    at += 46 + nameLength + extraLength + commentLength;
  }
  return names;
};

let tmp;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-zip-"));
});
afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("writeZip", () => {
  // Board 18 reads the box with its folder at the top of the zip
  it("zips the box with its folder at the top, once the file is closed", async () => {
    const names = b18Names("18Test", "1.0");
    for (const file of [names.json, names.image("Map"), names.image("Red")]) {
      fs.mkdirSync(path.dirname(path.join(tmp, file)), { recursive: true });
      fs.writeFileSync(path.join(tmp, file), "x");
    }

    await writeZip(tmp, names);

    expect(
      entries(path.join(tmp, names.zip))
        .filter((name) => !name.endsWith("/"))
        .sort(),
    ).toEqual([
      "board18-18Test-1.0/18Test-1.0.json",
      "board18-18Test-1.0/18Test-1.0/Map.png",
      "board18-18Test-1.0/18Test-1.0/Red.png",
    ]);
  });

  it("fails when the zip can not be written", async () => {
    const names = b18Names("18Test", "1.0");
    fs.mkdirSync(path.join(tmp, names.folder));

    await expect(
      writeZip(path.join(tmp, "missing"), names),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
});
