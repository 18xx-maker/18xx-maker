import { crc32, deflateSync, inflateSync } from "node:zlib";

// Real PNG files for tests: an 8 bit gray image (color type 0) made with every
// filter of the format, and a decoder of 8 bit gray and rgba images

const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "latin1");
  Buffer.from(data).copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
};

// The predictor of a filter (1 sub, 2 up, 3 average, 4 paeth) from the byte
// left (a), above (b) and above left (c)
const predict = (filter, a, b, c) =>
  [0, a, b, (a + b) >> 1, paeth(a, b, c)][filter];

// A gray png of width by height where the pixel at x, y is gray(x, y). Row y
// is filtered with filter y % 5, so every filter is in it. Without gray, only
// the header is real (for an image too big to make).
export const encodePng = ({ width, height }, gray, { channels = 1 } = {}) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = channels === 4 ? 6 : 0;

  let data = Buffer.alloc(0);
  if (gray) {
    const stride = width * channels;
    const raw = Buffer.alloc(height * (stride + 1));
    let prior = Buffer.alloc(stride);
    for (let y = 0; y < height; y++) {
      const row = Buffer.alloc(stride);
      for (let x = 0; x < width; x++) {
        for (let k = 0; k < channels; k++) {
          row[x * channels + k] = gray(x, y, k) & 255;
        }
      }
      const filter = y % 5;
      raw[y * (stride + 1)] = filter;
      for (let i = 0; i < stride; i++) {
        const a = i >= channels ? row[i - channels] : 0;
        const c = i >= channels ? prior[i - channels] : 0;
        raw[y * (stride + 1) + 1 + i] =
          (row[i] - predict(filter, a, prior[i], c)) & 255;
      }
      prior = row;
    }
    data = deflateSync(raw);
  }

  return new Uint8Array(
    Buffer.concat([
      SIGNATURE,
      chunk("IHDR", header),
      chunk("tEXt", Buffer.from("Software\0test", "latin1")),
      chunk("IDAT", data),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
};

// { width, height, channels, pixels } of an 8 bit gray, rgb or rgba png (not
// interlaced), with the bytes of the pixels row after row
export const decodePng = (bytes) => {
  const buffer = Buffer.from(bytes);
  let width, height, channels;
  const idat = [];
  for (let at = 8; at < buffer.length;) {
    const length = buffer.readUInt32BE(at);
    const type = buffer.toString("latin1", at + 4, at + 8);
    const data = buffer.subarray(at + 8, at + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      channels = { 0: 1, 2: 3, 6: 4 }[data[9]];
    }
    if (type === "IDAT") idat.push(data);
    at += 12 + length;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = new Uint8Array(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let i = 0; i < stride; i++) {
      const at = y * stride + i;
      const a = i >= channels ? pixels[at - channels] : 0;
      const b = y > 0 ? pixels[at - stride] : 0;
      const c = y > 0 && i >= channels ? pixels[at - stride - channels] : 0;
      pixels[at] =
        (raw[y * (stride + 1) + 1 + i] + predict(filter, a, b, c)) & 255;
    }
  }
  return { width, height, channels, pixels };
};
