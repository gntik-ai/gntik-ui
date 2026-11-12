// Byte-mode QR Code (Model 2) encoder, versions 1–40, error levels L/M/Q/H (ISO/IEC 18004).
// Pure and dependency-free: `encodeQr` returns the module matrix and nothing else. The component and
// `qrCodeSvg` draw it. Only byte mode is implemented: the value is always encoded as UTF-8 bytes.

export type QrErrorLevel = 'L' | 'M' | 'Q' | 'H';

/** The value does not fit a version 40 code at the requested error level. */
export class QrCapacityError extends RangeError {
  constructor(bytes: number, level: QrErrorLevel) {
    super(`Cannot encode ${bytes} bytes as a QR code at error level ${level}`);
    this.name = 'QrCapacityError';
  }
}

export interface QrMatrix {
  /** Modules per side (version × 4 + 17). */
  readonly size: number;
  readonly version: number;
  /** `modules[y][x]` is true for a dark module. */
  readonly modules: readonly (readonly boolean[])[];
}

const MIN_VERSION = 1;
const MAX_VERSION = 40;

// Index 0 is version 1. Error correction codewords per block and block counts, per level.
const ECC_PER_BLOCK: Record<QrErrorLevel, readonly number[]> = {
  L: [
    7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  M: [
    10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  ],
  Q: [
    13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  H: [
    17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
};
const BLOCK_COUNT: Record<QrErrorLevel, readonly number[]> = {
  L: [
    1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19,
    20, 21, 22, 24, 25,
  ],
  M: [
    1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33,
    35, 37, 38, 40, 43, 45, 47, 49,
  ],
  Q: [
    1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45,
    48, 51, 53, 56, 59, 62, 65, 68,
  ],
  H: [
    1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51,
    54, 57, 60, 63, 66, 70, 74, 77, 81,
  ],
};
// Two format-information bits that name each level.
const FORMAT_LEVEL_BITS: Record<QrErrorLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

const bit = (value: number, index: number): boolean => ((value >>> index) & 1) !== 0;

function alignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const size = version * 4 + 17;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
  const positions = [6];
  for (let position = size - 7; positions.length < count; position -= step) positions.splice(1, 0, position);
  return positions;
}

/** Modules that carry data or error correction (everything but the function patterns). */
function rawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const count = Math.floor(version / 7) + 2;
    result -= (25 * count - 10) * count - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

function dataCodewords(version: number, level: QrErrorLevel): number {
  return (
    Math.floor(rawDataModules(version) / 8) - ECC_PER_BLOCK[level][version - 1]! * BLOCK_COUNT[level][version - 1]!
  );
}

/** Largest UTF-8 byte length that fits version `version` at `level` in byte mode. */
export function byteCapacity(version: number, level: QrErrorLevel): number {
  const countBits = version <= 9 ? 8 : 16;
  return Math.floor((dataCodewords(version, level) * 8 - 4 - countBits) / 8);
}

// --- Reed–Solomon over GF(2^8), polynomial 0x11D ---------------------------------------------------

function gfMultiply(x: number, y: number): number {
  let product = 0;
  for (let i = 7; i >= 0; i--) {
    product = (product << 1) ^ ((product >>> 7) * 0x11d);
    product ^= ((y >>> i) & 1) * x;
  }
  return product;
}

function rsDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMultiply(result[j]!, root);
      if (j + 1 < degree) result[j] = result[j]! ^ result[j + 1]!;
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

/** Error correction codewords for `data`. */
export function rsRemainder(data: readonly number[], degree: number): number[] {
  const divisor = rsDivisor(degree);
  const result = new Array<number>(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ result.shift()!;
    result.push(0);
    divisor.forEach((coefficient, i) => {
      result[i] = result[i]! ^ gfMultiply(coefficient, factor);
    });
  }
  return result;
}

// --- Codewords -------------------------------------------------------------------------------------

function dataBytes(bytes: Uint8Array, version: number, level: QrErrorLevel): number[] {
  const bits: number[] = [];
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  push(0b0100, 4); // byte mode
  push(bytes.length, version <= 9 ? 8 : 16);
  for (const byte of bytes) push(byte, 8);
  const capacityBits = dataCodewords(version, level) * 8;
  push(0, Math.min(4, capacityBits - bits.length));
  push(0, (8 - (bits.length % 8)) % 8);
  const result: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j]!;
    result.push(byte);
  }
  for (let pad = 0xec; result.length < capacityBits / 8; pad ^= 0xec ^ 0x11) result.push(pad);
  return result;
}

/** Splits data into blocks, appends error correction to each and interleaves the result. */
function interleave(data: readonly number[], version: number, level: QrErrorLevel): number[] {
  const blockCount = BLOCK_COUNT[level][version - 1]!;
  const eccLength = ECC_PER_BLOCK[level][version - 1]!;
  const rawCodewords = Math.floor(rawDataModules(version) / 8);
  const shortBlocks = blockCount - (rawCodewords % blockCount);
  const shortLength = Math.floor(rawCodewords / blockCount);
  const blocks: number[][] = [];
  let offset = 0;
  for (let i = 0; i < blockCount; i++) {
    const length = shortLength - eccLength + (i < shortBlocks ? 0 : 1);
    const block = data.slice(offset, offset + length);
    offset += length;
    const ecc = rsRemainder(block, eccLength);
    if (i < shortBlocks) block.push(0); // placeholder, skipped below
    blocks.push(block.concat(ecc));
  }
  const result: number[] = [];
  for (let i = 0; i < blocks[0]!.length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortLength - eccLength || j >= shortBlocks) result.push(block[i]!);
    });
  }
  return result;
}

// --- Matrix ----------------------------------------------------------------------------------------

type Grid = boolean[][];

const MASKS: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

/** The 15 format bits (level and mask, BCH(15,5) coded and XOR-masked). */
export function formatBits(level: QrErrorLevel, mask: number): number {
  const data = (FORMAT_LEVEL_BITS[level] << 3) | mask;
  let remainder = data;
  for (let i = 0; i < 10; i++) remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  return ((data << 10) | remainder) ^ 0x5412;
}

/** The 18 version bits (version and BCH(18,6) code), for versions 7 and up. */
export function versionBits(version: number): number {
  let remainder = version;
  for (let i = 0; i < 12; i++) remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25);
  return (version << 12) | remainder;
}

function penalty(modules: Grid): number {
  const size = modules.length;
  let result = 0;
  let dark = 0;
  const finderLike = (line: readonly boolean[]): number => {
    let found = 0;
    for (let i = 0; i + 11 <= line.length; i++) {
      const window = line
        .slice(i, i + 11)
        .map(Number)
        .join('');
      if (window === '10111010000' || window === '00001011101') found++;
    }
    return found;
  };
  const runs = (line: readonly boolean[]): number => {
    let score = 0;
    let length = 1;
    for (let i = 1; i <= line.length; i++) {
      if (i < line.length && line[i] === line[i - 1]) length++;
      else {
        if (length >= 5) score += 3 + (length - 5);
        length = 1;
      }
    }
    return score;
  };
  for (let a = 0; a < size; a++) {
    const row = modules[a]!;
    const column = modules.map((r) => r[a]!);
    result += runs(row) + runs(column) + 40 * (finderLike(row) + finderLike(column));
    for (let b = 0; b < size; b++) {
      if (row[b]) dark++;
      if (a + 1 < size && b + 1 < size) {
        const value = row[b];
        if (value === row[b + 1] && value === modules[a + 1]![b] && value === modules[a + 1]![b + 1]) result += 3;
      }
    }
  }
  const total = size * size;
  result += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
  return result;
}

function buildMatrix(codewords: readonly number[], version: number, level: QrErrorLevel): Grid {
  const size = version * 4 + 17;
  const modules: Grid = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const reserved: Grid = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const set = (x: number, y: number, dark: boolean) => {
    modules[y]![x] = dark;
    reserved[y]![x] = true;
  };

  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [
    [3, 3],
    [size - 4, 3],
    [3, size - 4],
  ] as const) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, distance !== 2 && distance !== 4);
      }
    }
  }
  const positions = alignmentPositions(version);
  const last = positions.length - 1;
  positions.forEach((cx, i) => {
    positions.forEach((cy, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    });
  });

  const drawFormat = (mask: number) => {
    const bits = formatBits(level, mask);
    for (let i = 0; i <= 5; i++) set(8, i, bit(bits, i));
    set(8, 7, bit(bits, 6));
    set(8, 8, bit(bits, 7));
    set(7, 8, bit(bits, 8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(bits, i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(bits, i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(bits, i));
    set(8, size - 8, true); // the always-dark module
  };
  drawFormat(0);
  if (version >= 7) {
    const bits = versionBits(version);
    for (let i = 0; i < 18; i++) {
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(a, b, bit(bits, i));
      set(b, a, bit(bits, i));
    }
  }

  // Zigzag placement of the codeword bits, two columns at a time, skipping the vertical timing column.
  let index = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < size; vertical++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vertical : vertical;
        if (!reserved[y]![x] && index < codewords.length * 8) {
          modules[y]![x] = bit(codewords[index >>> 3]!, 7 - (index & 7));
          index++;
        }
      }
    }
  }

  const applyMask = (mask: number) => {
    const condition = MASKS[mask]!;
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) if (!reserved[y]![x] && condition(x, y)) modules[y]![x] = !modules[y]![x];
  };
  let best = 0;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask);
    drawFormat(mask);
    const score = penalty(modules);
    if (score < bestPenalty) {
      best = mask;
      bestPenalty = score;
    }
    applyMask(mask); // undo
  }
  applyMask(best);
  drawFormat(best);
  return modules;
}

/**
 * Encodes `value` as UTF-8 bytes in the smallest version that holds it at `level`.
 * Throws `QrCapacityError` when it does not fit version 40.
 */
export function encodeQr(value: string, level: QrErrorLevel = 'M'): QrMatrix {
  const bytes = new TextEncoder().encode(value);
  let version = MIN_VERSION;
  while (version <= MAX_VERSION && byteCapacity(version, level) < bytes.length) version++;
  if (version > MAX_VERSION) throw new QrCapacityError(bytes.length, level);
  const codewords = interleave(dataBytes(bytes, version, level), version, level);
  const modules = buildMatrix(codewords, version, level);
  return { size: version * 4 + 17, version, modules };
}
