/**
 * Fractional Indexing Utility
 * Used to support professional-grade drag-and-drop reordering without mass-updating database rows.
 */

export function generateInitialIndex(): string {
  return 'n'; // Middle of the lowercase alphabet
}

export function generateIndexBetween(prev: string | null, next: string | null): string {
  if (!prev && !next) return generateInitialIndex();
  if (!prev) return String.fromCharCode(next!.charCodeAt(0) - 1);
  if (!next) return String.fromCharCode(prev!.charCodeAt(0) + 1);

  // Simple midpoint calculation between characters
  const mid = (prev.charCodeAt(prev.length - 1) + next.charCodeAt(0)) / 2;
  return prev + String.fromCharCode(Math.floor(mid));
}

/**
 * Note: A production-ready fractional indexing lib (like 'fractional-indexing') 
 * would be better for edge cases, but for this implementation we use a clean base logic.
 */
