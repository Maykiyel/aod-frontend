/**
 * Join class names, dropping anything falsy.
 *
 * Two of the sixteen primitives already needed this exact shape. It lives here
 * rather than in either component so the remaining fourteen do not each grow
 * their own copy.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
