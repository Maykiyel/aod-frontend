/** Every rule `UpdateTeamKeywordsRequest` enforces that the form's own state can
 *  decide, pre-empted here so none of them costs a round trip (spec #38). The
 *  server's objections still land on the field that names them. */

export const KEYWORD_MAX_LENGTH = 64;
export const KEYWORDS_PER_CATEGORY = 200;

/** Case folds the way the server's reconciler does, so "Smoke" and "smoke" are
 *  the same word here too. */
const fold = (word: string) => word.trim().toLowerCase();

const holds = (list: string[], word: string) => list.some((held) => fold(held) === fold(word));

/** The reason this keyword cannot be added, or null. */
export function keywordProblem(word: string, category: string[], other: string[]): string | null {
  const candidate = word.trim();

  if (!candidate) return 'Enter a keyword to add.';
  if (/\s/.test(candidate)) {
    return 'Detection matches single words, so a keyword cannot contain a space.';
  }
  if (candidate.length > KEYWORD_MAX_LENGTH) {
    return `A keyword can be at most ${KEYWORD_MAX_LENGTH} characters.`;
  }
  if (holds(category, candidate)) return 'This category already lists that keyword.';
  if (holds(other, candidate)) return 'That keyword is already in the other category.';
  if (category.length >= KEYWORDS_PER_CATEGORY) {
    return `A category holds at most ${KEYWORDS_PER_CATEGORY} keywords.`;
  }

  return null;
}
