import type { Kata } from "../types/editor";

export function uniqueLeetcodeProblemKatas(katas: readonly Kata[]): Kata[] {
  const seenLeetcodeNumbers = new Set<number>();
  const seenUnmappedIds = new Set<number>();
  const unique: Kata[] = [];

  for (const kata of katas) {
    if (kata.leetcodeNumber == null) {
      if (seenUnmappedIds.has(kata.id)) continue;
      seenUnmappedIds.add(kata.id);
      unique.push(kata);
      continue;
    }

    if (seenLeetcodeNumbers.has(kata.leetcodeNumber)) continue;
    seenLeetcodeNumbers.add(kata.leetcodeNumber);
    unique.push(kata);
  }

  return unique;
}
