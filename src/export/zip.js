import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

import { insideFolder } from "./sink.js";

const LOCAL = 0x04034b50;
const CENTRAL = 0x02014b50;
const END = 0x06054b50;
const UTF8 = 0x0800;
const MAX = 0xffffffff;

// MS-DOS date and time, which is what zip stores
const dos = (date) => ({
  time:
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    (date.getSeconds() >> 1),
  date:
    ((Math.max(date.getFullYear(), 1980) - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate(),
});

// Every directory and file in dir (zip names, with directories ending in /),
// each directory before its content
const walk = (dir, name) => {
  const entries = [{ name: `${name}/`, file: dir, directory: true }];
  for (const item of fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) entries.push(...walk(file, `${name}/${item.name}`));
    else if (item.isFile())
      entries.push({ name: `${name}/${item.name}`, file, directory: false });
  }
  return entries;
};

const header = (sig, fields) => {
  const size = sig === LOCAL ? 30 : 46;
  const buf = Buffer.alloc(size);
  buf.writeUInt32LE(sig, 0);
  let at = 4;
  for (const [bytes, value] of fields) {
    if (bytes === 2) buf.writeUInt16LE(value, at);
    else buf.writeUInt32LE(value, at);
    at += bytes;
  }
  return buf;
};

// Writes the zip of a Board 18 box (the names of b18Names) from its folder in
// out: board18-<game>-<version>.zip. Resolves when the file is closed. Node
// only.
export const writeZip = async (out, names) => {
  // Like the sink, the zip and the folder stay in out
  insideFolder(out, names.zip);
  insideFolder(out, names.folder);

  const chunks = [];
  const central = [];
  let offset = 0;
  const push = (buf) => {
    chunks.push(buf);
    offset += buf.length;
  };

  for (const { name, file, directory } of walk(
    `${out}/${names.folder}`,
    names.folder,
  )) {
    const raw = directory ? Buffer.alloc(0) : fs.readFileSync(file);
    const data = directory ? raw : zlib.deflateRawSync(raw, { level: 9 });
    const method = directory ? 0 : 8;
    const crc = zlib.crc32(raw);
    const { time, date } = dos(fs.statSync(file).mtime);
    const nameBuf = Buffer.from(name, "utf-8");
    if (data.length > MAX || offset > MAX)
      throw new Error(`${names.zip} is too large to zip`);

    const common = [
      [2, 20], // version needed
      [2, UTF8],
      [2, method],
      [2, time],
      [2, date],
      [4, crc],
      [4, data.length],
      [4, raw.length],
      [2, nameBuf.length],
      [2, 0], // extra field length
    ];
    central.push({ nameBuf, common, directory, offset });
    push(header(LOCAL, common));
    push(nameBuf);
    push(data);
  }

  const start = offset;
  for (const { nameBuf, common, directory, offset: at } of central) {
    push(
      header(CENTRAL, [
        [2, 20], // version made by
        ...common,
        [2, 0], // comment length
        [2, 0], // disk number
        [2, 0], // internal attributes
        [4, directory ? 0x10 : 0], // external attributes
        [4, at],
      ]),
    );
    push(nameBuf);
  }

  const end = Buffer.alloc(22);
  end.writeUInt32LE(END, 0);
  end.writeUInt16LE(central.length, 8);
  end.writeUInt16LE(central.length, 10);
  end.writeUInt32LE(offset - start, 12);
  end.writeUInt32LE(start, 16);
  push(end);

  await fs.promises.writeFile(`${out}/${names.zip}`, Buffer.concat(chunks));
};
