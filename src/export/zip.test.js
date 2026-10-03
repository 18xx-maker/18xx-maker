import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";

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

  it("stores each file deflated, with its crc, so that unzip reads it back", async () => {
    const names = b18Names("18Test", "1.0");
    const file = path.join(tmp, names.json);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const content = '{"name":"ünïcode"}'.repeat(100);
    fs.writeFileSync(file, content);

    await writeZip(tmp, names);

    const zip = fs.readFileSync(path.join(tmp, names.zip));
    const at = zip.readUInt32LE(
      zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06])) + 16,
    );
    // The first entry is the folder, find the json by its local header
    const local = zip.indexOf(Buffer.from(`${names.json}`)) - 30;
    expect(zip.readUInt32LE(local)).toBe(0x04034b50);
    const size = zip.readUInt32LE(local + 18);
    const nameLength = zip.readUInt16LE(local + 26);
    const data = zip.subarray(
      local + 30 + nameLength,
      local + 30 + nameLength + size,
    );
    const inflated = zlib.inflateRawSync(data);
    expect(inflated.toString("utf-8")).toBe(content);
    expect(zip.readUInt32LE(local + 14)).toBe(zlib.crc32(inflated));
    expect(at).toBeGreaterThan(local);
  });

  it("does not write a zip or read a folder outside of the output folder", async () => {
    const out = path.join(tmp, "out");
    fs.mkdirSync(out);
    const names = b18Names("18Test", "1.0");

    await expect(
      writeZip(out, { ...names, zip: "../evil.zip" }),
    ).rejects.toThrow("is outside of");
    await expect(
      writeZip(out, { ...names, folder: "../../etc" }),
    ).rejects.toThrow("is outside of");
    await expect(
      writeZip(out, { ...names, zip: path.join(tmp, "abs.zip") }),
    ).rejects.toThrow("is outside of");
    expect(fs.existsSync(path.join(tmp, "evil.zip"))).toBe(false);
    expect(fs.existsSync(path.join(tmp, "abs.zip"))).toBe(false);
  });

  it("fails when the zip can not be written", async () => {
    const names = b18Names("18Test", "1.0");
    fs.mkdirSync(path.join(tmp, names.folder));

    await expect(
      writeZip(path.join(tmp, "missing"), names),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
});
