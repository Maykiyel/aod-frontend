/** Join class names, dropping falsy ones. Lives here so the remaining fourteen
 *  primitives do not each grow their own copy. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
