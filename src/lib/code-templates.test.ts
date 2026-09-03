import { describe, expect, it } from "vitest";
import { codeTemplatesForLanguage } from "./code-templates";

describe("code templates", () => {
  it("provides searchable snippets for supported editor languages", () => {
    for (const language of ["javascript", "python", "java"]) {
      const templates = codeTemplatesForLanguage(language);

      expect(templates).toHaveLength(72);
      expect(templates.every((template) => (
        template.id.trim()
        && template.title.trim()
        && template.description.trim()
        && template.code.trim()
        && template.keywords.length > 0
      ))).toBe(true);
    }
  });

  it("includes templates from the full cheatsheet source categories", () => {
    const ids = codeTemplatesForLanguage("javascript").map((template) => template.id);

    expect(ids).toContain("array:sliding-window");
    expect(ids).toContain("graph:dijkstra");
    expect(ids).toContain("dynamic-programming:top-down");
    expect(ids).toContain("data-structures:trie");
    expect(ids).toContain("sorting-algorithms:quick-sort");
    expect(ids).toContain("recursion:frame");
    expect(ids).toContain("recursion:backtracking");
  });

  it("keeps the supplemental recursion templates as comment-only scaffolds", () => {
    const pythonTemplates = codeTemplatesForLanguage("python");

    expect(pythonTemplates.find((template) => template.id === "recursion:frame")?.code).toBe(
      "# Base case: stop when this frame has no smaller recursive work left.\n# Process before recursion: inspect state, update local values, or choose a path.\n# Recurse: call the function with a smaller or simpler state.\n# Process after recursion: use the child result, undo temporary state, or finish this frame.\n# Return / combine: pass this frame's answer back to its caller.",
    );
    expect(pythonTemplates.find((template) => template.id === "recursion:backtracking")?.code).toBe(
      "# Base case: record or return when the current partial solution is complete.\n# Iterate choices: try each valid next option from this state.\n# Choose / process: add the choice and mark any state it affects.\n# Recurse: explore everything reachable after that choice.\n# Unchoose / process after recursion: remove the choice so the next option starts clean.",
    );
  });

  it("does not expose snippets for unknown languages", () => {
    expect(codeTemplatesForLanguage("ruby")).toEqual([]);
  });
});
