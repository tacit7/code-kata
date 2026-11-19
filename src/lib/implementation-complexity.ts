import type { Kata, SolutionVariant } from "../types/editor";

type ComplexityKata = Pick<Kata, "solution" | "solutionVariants">;

export type ImplementationSize = "Tiny" | "Short" | "Medium" | "Long" | "Heavy";

export const IMPLEMENTATION_SIZES: ImplementationSize[] = ["Tiny", "Short", "Medium", "Long", "Heavy"];

export interface ImplementationComplexity {
  size: ImplementationSize | null;
  codeLines: number;
  normalizedCharacters: number;
  label: string;
  badgeClass: string;
  title: string;
}

function implementationSource(kata: ComplexityKata): string | null {
  const firstVariant: SolutionVariant | undefined = kata.solutionVariants?.[0];
  return firstVariant?.code ?? kata.solution ?? null;
}

function meaningfulCodeLines(source: string): string[] {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => (
      line.length > 0 &&
      !line.startsWith("#") &&
      !line.startsWith("//") &&
      !line.startsWith("/*") &&
      !line.startsWith("*") &&
      !line.startsWith("*/")
    ));
}

function normalizedCharacterCount(lines: string[]): number {
  return lines
    .join("")
    .replace(/\s+/g, "")
    .length;
}

function sizeFor(codeLines: number): ImplementationSize {
  if (codeLines <= 5) return "Tiny";
  if (codeLines <= 10) return "Short";
  if (codeLines <= 20) return "Medium";
  if (codeLines <= 35) return "Long";
  return "Heavy";
}

export function implementationSizeRank(size: ImplementationSize | null): number {
  if (size == null) return Number.POSITIVE_INFINITY;
  const rank = IMPLEMENTATION_SIZES.indexOf(size);
  return rank === -1 ? Number.POSITIVE_INFINITY : rank;
}

function badgeClassFor(size: ImplementationSize): string {
  switch (size) {
    case "Tiny":
      return "badge-success";
    case "Short":
      return "badge-info";
    case "Medium":
      return "badge-warning";
    case "Long":
    case "Heavy":
      return "badge-error";
  }
}

export function implementationComplexityFor(kata: ComplexityKata): ImplementationComplexity {
  const source = implementationSource(kata);
  if (!source) {
    return {
      size: null,
      codeLines: 0,
      normalizedCharacters: 0,
      label: "-",
      badgeClass: "badge-ghost",
      title: "No reference implementation available",
    };
  }

  const lines = meaningfulCodeLines(source);
  const size = sizeFor(lines.length);
  const normalizedCharacters = normalizedCharacterCount(lines);

  return {
    size,
    codeLines: lines.length,
    normalizedCharacters,
    label: size,
    badgeClass: badgeClassFor(size),
    title: `Implementation size: ${size}; ${lines.length} executable LOC; ${normalizedCharacters} normalized code chars`,
  };
}
