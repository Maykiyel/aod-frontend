import { describe, expect, it } from 'vitest';
import { withDuration } from '@/lib/capture/webm-duration';

/** The one test in this repo below the route seam, and a deliberate departure
 *  from `conventions.md`: the reason it gives — a primitive's correctness shows
 *  up in the screen that uses it — cannot hold for a pure function the capture
 *  port hides and that jsdom has no `MediaRecorder` to exercise (ADR 0012). */

function vint(value: number, length = 1): number[] {
  let n = length;
  while (value >= 2 ** (7 * n) - 1) n += 1;
  const out: number[] = [];
  let rest = value;
  for (let i = n - 1; i >= 0; i -= 1) {
    out[i] = rest % 256;
    rest = Math.floor(rest / 256);
  }
  out[0] |= 0x80 >> (n - 1);
  return out;
}

/** Info holding just a TimecodeScale, inside a Segment of unknown size, which
 *  is the shape MediaRecorder writes. */
function fakeWebm(): Uint8Array<ArrayBuffer> {
  const timecodeScale = [0x2a, 0xd7, 0xb1, 0x83, 0x0f, 0x42, 0x40]; // 1_000_000
  const info = [0x15, 0x49, 0xa9, 0x66, ...vint(timecodeScale.length), ...timecodeScale];
  const cluster = [0x1f, 0x43, 0xb6, 0x75, 0x84, 1, 2, 3, 4];
  const segment = [0x18, 0x53, 0x80, 0x67, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
  const header = [0x1a, 0x45, 0xdf, 0xa3, 0x84, 1, 2, 3, 4];
  return new Uint8Array([...header, ...segment, ...info, ...cluster]) as Uint8Array<ArrayBuffer>;
}

function readDuration(bytes: Uint8Array): number | null {
  for (let i = 0; i < bytes.length - 11; i += 1) {
    if (bytes[i] === 0x44 && bytes[i + 1] === 0x89 && bytes[i + 2] === 0x88) {
      return new DataView(bytes.buffer, bytes.byteOffset + i + 3, 8).getFloat64(0, false);
    }
  }
  return null;
}

describe('withDuration', () => {
  it('writes the duration in timecode ticks into Segment Info', async () => {
    const patched = await withDuration(new Blob([fakeWebm()], { type: 'video/webm' }), 125_000);
    const bytes = new Uint8Array(await patched.arrayBuffer());

    // 125_000 ms at a 1_000_000 ns scale is 125_000 ticks.
    expect(readDuration(bytes)).toBe(125_000);
  });

  it("grows the Info element's own size so the tree still parses", async () => {
    const before = fakeWebm();
    const patched = await withDuration(new Blob([before], { type: 'video/webm' }), 1_000);
    const after = new Uint8Array(await patched.arrayBuffer());

    expect(after.length).toBe(before.length + 11);
    // Info's size vint sat at index 4 of the element; it must now cover 11 more.
    const infoStart = after.indexOf(0x15);
    expect(after[infoStart + 4]).toBe(0x80 | (7 + 11));
    // The cluster after it is untouched.
    expect([...after.slice(-9)]).toEqual([0x1f, 0x43, 0xb6, 0x75, 0x84, 1, 2, 3, 4]);
  });

  it('leaves a blob it does not recognise exactly as it found it', async () => {
    const junk = new Blob([new Uint8Array([1, 2, 3, 4, 5])], { type: 'video/webm' });
    expect(await withDuration(junk, 1_000)).toBe(junk);
    const real = new Blob([fakeWebm()], { type: 'video/webm' });
    expect(await withDuration(real, 0)).toBe(real);
  });
});
