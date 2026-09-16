/** A `MediaRecorder` WebM written in chunks carries no Duration, so the file
 *  seeks as unknown and every downstream player inherits that. The duration is
 *  known at stop time, so it is written into the container before the blob
 *  leaves the browser (spec #40). Written rather than taken as a dependency:
 *  the whole job is one EBML element in one place. */

const SEGMENT = 0x18538067;
const INFO = 0x1549a966;
const TIMECODE_SCALE = 0x2ad7b1;
const DURATION = 0x4489;

/** Nanoseconds per tick when the file does not say otherwise. */
const DEFAULT_TIMECODE_SCALE = 1_000_000;

interface Element {
  id: number;
  /** Where this element's own bytes begin. */
  start: number;
  /** Where its size vint begins, and how many bytes that vint takes. */
  sizeStart: number;
  sizeLength: number;
  contentStart: number;
  contentEnd: number;
  /** A size of all ones, which is EBML for "runs to the end of its parent". */
  unknownSize: boolean;
}

/** EBML ids keep their length marker; sizes drop theirs. */
function readVint(bytes: Uint8Array, at: number, keepMarker: boolean) {
  const first = bytes[at];
  if (first === undefined || first === 0) return null;

  let length = 1;
  for (let mask = 0x80; mask > 0 && (first & mask) === 0; mask >>= 1) length += 1;
  if (at + length > bytes.length) return null;

  let value = keepMarker ? first : first & (0xff >> length);
  let allOnes = (first & (0xff >> length)) === 0xff >> length;

  for (let i = 1; i < length; i += 1) {
    value = value * 256 + bytes[at + i];
    if (bytes[at + i] !== 0xff) allOnes = false;
  }

  return { value, length, allOnes };
}

/** The smallest vint holding `value`, widened to `atLeast` bytes if asked. */
function writeVint(value: number, atLeast = 1): Uint8Array {
  let length = atLeast;
  while (value >= 2 ** (7 * length) - 1) length += 1;

  const out = new Uint8Array(length);
  let rest = value;
  for (let i = length - 1; i >= 0; i -= 1) {
    out[i] = rest % 256;
    rest = Math.floor(rest / 256);
  }
  out[0] |= 0x80 >> (length - 1);
  return out;
}

function readElement(bytes: Uint8Array, at: number): Element | null {
  const id = readVint(bytes, at, true);
  if (!id) return null;
  const size = readVint(bytes, at + id.length, false);
  if (!size) return null;

  const contentStart = at + id.length + size.length;

  return {
    id: id.value,
    start: at,
    sizeStart: at + id.length,
    sizeLength: size.length,
    contentStart,
    contentEnd: size.allOnes ? bytes.length : Math.min(bytes.length, contentStart + size.value),
    unknownSize: size.allOnes,
  };
}

function findChild(bytes: Uint8Array, from: number, to: number, id: number): Element | null {
  let at = from;
  while (at < to) {
    const element = readElement(bytes, at);
    if (!element) return null;
    if (element.id === id) return element;
    at = element.contentEnd;
    if (at <= element.start) return null;
  }
  return null;
}

function readUint(bytes: Uint8Array, element: Element): number {
  let value = 0;
  for (let i = element.contentStart; i < element.contentEnd; i += 1) value = value * 256 + bytes[i];
  return value;
}

function float64(value: number): Uint8Array {
  const out = new Uint8Array(8);
  new DataView(out.buffer).setFloat64(0, value, false);
  return out;
}

/** Write `durationMs` into the blob's Segment Info. Returns the blob untouched
 *  when the container is not the shape this expects — a file that seeks as
 *  unknown is worse than no file, but a corrupted one is worse than both. */
export async function withDuration(blob: Blob, durationMs: number): Promise<Blob> {
  if (!blob.size || durationMs <= 0) return blob;

  const bytes = new Uint8Array(await blob.arrayBuffer());
  const segment = findChild(bytes, 0, bytes.length, SEGMENT);
  if (!segment) return blob;

  const info = findChild(bytes, segment.contentStart, segment.contentEnd, INFO);
  if (!info || info.unknownSize) return blob;

  const scaleElement = findChild(bytes, info.contentStart, info.contentEnd, TIMECODE_SCALE);
  const scale = scaleElement ? readUint(bytes, scaleElement) : DEFAULT_TIMECODE_SCALE;
  const ticks = (durationMs * 1_000_000) / (scale || DEFAULT_TIMECODE_SCALE);

  const existing = findChild(bytes, info.contentStart, info.contentEnd, DURATION);

  // Already there and eight bytes wide: overwrite the float where it sits.
  if (existing && existing.contentEnd - existing.contentStart === 8) {
    bytes.set(float64(ticks), existing.contentStart);
    return new Blob([bytes], { type: blob.type });
  }
  if (existing) return blob;

  const element = new Uint8Array([0x44, 0x89, 0x88, ...float64(ticks)]);
  const grownSize = writeVint(info.contentEnd - info.contentStart + element.length, info.sizeLength);
  const grewBy = element.length + grownSize.length - info.sizeLength;

  const parts: Uint8Array[] = [];
  parts.push(bytes.subarray(0, segment.sizeStart));

  // A Segment of known size has to grow with its child; MediaRecorder writes one
  // of unknown size, which needs nothing.
  if (segment.unknownSize) {
    parts.push(bytes.subarray(segment.sizeStart, info.sizeStart));
  } else {
    parts.push(writeVint(segment.contentEnd - segment.contentStart + grewBy, segment.sizeLength));
    parts.push(bytes.subarray(segment.contentStart, info.sizeStart));
  }

  parts.push(grownSize);
  parts.push(bytes.subarray(info.contentStart, info.contentEnd));
  parts.push(element);
  parts.push(bytes.subarray(info.contentEnd));

  return new Blob(parts as BlobPart[], { type: blob.type });
}
