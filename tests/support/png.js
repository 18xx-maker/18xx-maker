// A small valid PNG (a solid color), or one with the given header size and
// signature, for the checks of the custom images. Plain JavaScript (stored
// deflate blocks), so it runs in Node and in the browser tests alike.
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (bytes) => {
  let c = 0xffffffff;
  for (const byte of bytes) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const adler = (bytes) => {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
};
const u32 = (n) => [
  (n >>> 24) & 255,
  (n >>> 16) & 255,
  (n >>> 8) & 255,
  n & 255,
];
const ascii = (text) => Array.from(text, (c) => c.charCodeAt(0));

const chunk = (type, data) => {
  const body = [...ascii(type), ...data];
  return [...u32(data.length), ...body, ...u32(crc(body))];
};

// zlib data of stored (uncompressed) blocks
const zlib = (bytes) => {
  const out = [0x78, 0x01];
  for (let at = 0; at < bytes.length || at === 0; at += 65535) {
    const part = bytes.slice(at, at + 65535);
    const last = at + 65535 >= bytes.length;
    out.push(last ? 1 : 0, part.length & 255, part.length >> 8);
    out.push(~part.length & 255, (~part.length >> 8) & 255, ...part);
    if (last) break;
  }
  return [...out, ...u32(adler(bytes))];
};

export const makePng = ({ width = 2, height = 2, signature = true } = {}) => {
  // Real pixel data only for a small picture; a big header is all the check reads
  const rows = Math.min(height, 8);
  const pixels = new Array((Math.min(width, 8) * 4 + 1) * rows).fill(0);
  const png = Uint8Array.from([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a,
    ...chunk("IHDR", [...u32(width), ...u32(height), 8, 6, 0, 0, 0]),
    ...chunk("IDAT", zlib(pixels)),
    ...chunk("IEND", []),
  ]);
  if (!signature) png[1] = 0x51;
  return png;
};
