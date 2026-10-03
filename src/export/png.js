// PNG files: the resolution of an image in its pHYs chunk, so that print
// software places it at its real size. Chromium's PNGs have none.
// Plain JS on Uint8Array, no Node APIs.

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const METERS_PER_INCH = 0.0254;

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (bytes) => {
  let c = 0xffffffff;
  for (const byte of bytes) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

// Pixels per meter of a resolution in dots per inch: 300 dpi is 11811
export const pixelsPerMeter = (dpi) => Math.round(dpi / METERS_PER_INCH);

const isPng = (bytes) => SIGNATURE.every((byte, i) => bytes[i] === byte);

// The chunks of a png: { type, start, end } with start and end around the
// whole chunk (length, type, data and crc)
const chunks = (bytes) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const found = [];
  for (let at = 8; at + 12 <= bytes.length;) {
    const length = view.getUint32(at);
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    found.push({ type, start: at, end: at + 12 + length });
    at += 12 + length;
  }
  return found;
};

// The size in pixels and the resolution in pixels per meter (null without a
// pHYs chunk) of a png
export const readPng = (bytes) => {
  if (!isPng(bytes)) throw new Error("Not a PNG file");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const phys = chunks(bytes).find(({ type }) => type === "pHYs");

  return {
    width: view.getUint32(16),
    height: view.getUint32(20),
    pixelsPerMeter: phys ? view.getUint32(phys.start + 8) : null,
  };
};

// A png with its resolution, as a pHYs chunk (in the units of the meter) after
// the IHDR chunk. A pHYs chunk it already has is replaced.
export const withResolution = (bytes, dpi) => {
  if (!isPng(bytes)) throw new Error("Not a PNG file");

  const chunk = new Uint8Array(21);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4); // pHYs
  view.setUint32(8, pixelsPerMeter(dpi));
  view.setUint32(12, pixelsPerMeter(dpi));
  chunk[16] = 1;
  view.setUint32(17, crc32(chunk.subarray(4, 17)));

  const parts = [bytes.subarray(0, 8)];
  for (const { type, start, end } of chunks(bytes)) {
    if (type !== "pHYs") parts.push(bytes.subarray(start, end));
    if (type === "IHDR") parts.push(chunk);
  }

  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
};

const concat = (parts) => {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
};

// The bytes of a stream of compression ("deflate", the zlib format of PNG
// image data) of bytes
const transform = (bytes, stream) =>
  new Response(new Blob([bytes]).stream().pipeThrough(stream))
    .arrayBuffer()
    .then((buffer) => new Uint8Array(buffer));

const chunk = (type, data) => {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(new TextEncoder().encode(type), 4);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
};

// Bytes of a pixel of an 8 bit png by its color type: gray, rgb, palette,
// gray and alpha, rgba
const BYTES_PER_PIXEL = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

// The top left width by height pixels of a png (8 bits, not interlaced, what
// Chromium writes). Every row keeps its filter: a filtered byte depends only
// on the bytes left of it and above it, so cutting off rows at the bottom and
// pixels at the right of each row leaves the others as they were. The other
// chunks are kept.
export const cropPng = async (bytes, width, height) => {
  const size = readPng(bytes);
  if (width === size.width && height === size.height) return bytes;
  if (width > size.width || height > size.height || width < 1 || height < 1) {
    throw new Error(
      `A ${size.width} x ${size.height} PNG can not be cut to ` +
        `${width} x ${height}`,
    );
  }

  const header = bytes.slice(16, 29);
  const [depth, colorType, , , interlace] = header.subarray(8);
  const pixel = BYTES_PER_PIXEL[colorType];
  if (depth !== 8 || interlace !== 0 || !pixel) {
    throw new Error("Only an 8 bit PNG that is not interlaced can be cut");
  }

  const found = chunks(bytes);
  const data = await transform(
    concat(
      found
        .filter(({ type }) => type === "IDAT")
        .map(({ start, end }) => bytes.subarray(start + 8, end - 4)),
    ),
    new DecompressionStream("deflate"),
  );
  const stride = 1 + size.width * pixel;
  const rows = Array.from({ length: height }, (_, y) =>
    data.subarray(y * stride, y * stride + 1 + width * pixel),
  );
  const image = await transform(concat(rows), new CompressionStream("deflate"));

  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);

  const parts = [bytes.subarray(0, 8)];
  let written = false;
  for (const { type, start, end } of found) {
    if (type === "IHDR") parts.push(chunk("IHDR", header));
    else if (type !== "IDAT") parts.push(bytes.subarray(start, end));
    else if (!written) {
      parts.push(chunk("IDAT", image));
      written = true;
    }
  }
  return concat(parts);
};
