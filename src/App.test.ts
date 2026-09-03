import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("App routes", () => {
  it("routes editor problem URLs to the editor page", () => {
    const source = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

    expect(source).toContain('const EditorPage = lazy(');
    expect(source).toContain('path="/editor/:kataId" element={<EditorPage />}');
    expect(source).not.toContain('path="/editor/:kataId" element={<Navigate to="/problems" replace />}');
  });
});
