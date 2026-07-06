// Dev-only: window.__rubyStress(50) — repeated warm runs for the spike's
// memory check (spec §1.5). Watch memory in Activity Monitor / devtools.
import { runRubyTests } from "./ruby-runner";

export async function rubyStress(runs = 50): Promise<string> {
  const user = "def add(a, b)\n  a + b\nend";
  const tests = "def test_add\n  assert_equal(3, add(1, 2))\nend";
  const start = performance.now();
  for (let i = 0; i < runs; i++) {
    const results = await runRubyTests(user, tests);
    if (!results[0]?.passed) return `run ${i} failed: ${JSON.stringify(results)}`;
  }
  const ms = Math.round(performance.now() - start);
  return `${runs} runs OK in ${ms}ms (${Math.round(ms / runs)}ms/run avg)`;
}
