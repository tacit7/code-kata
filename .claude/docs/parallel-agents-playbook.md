# Parallel Agents Playbook

Operational guide for breaking work into parallel agents in Claude Code. Focuses on when to use them, how to decompose tasks, and how to avoid common mistakes.

---

## Decision Tree: Agent vs Script vs Manual

Before spawning an agent, ask:

```
Is the task mechanical (find/replace, sort, rename, reformat)?
  → Write a bash/node script. Don't burn tokens.

Does it need judgment (refactoring, writing new logic, research)?
  → Use an agent.

Does it need EITS tracking (session hierarchy, todo progress)?
  → i-spawn-agent with parent_agent_id + parent_session_id

Does it need full process isolation (no shared state, no context bleed)?
  → claude -p --dangerously-skip-permissions

Is it a quick lookup that benefits from conversation context?
  → Task tool (built-in subagent)
```

### Tool Selection Summary

| Scenario | Tool | Why |
|----------|------|-----|
| Tracked work with session hierarchy | `i-spawn-agent` | EITS integration, parent/child tracking |
| Fully isolated independent task | `claude -p` | Separate process, no context leakage |
| Quick research using conversation context | Task tool | Shares parent context, fast to spawn |
| Mechanical file transforms | Bash script | Faster, cheaper, deterministic |

---

## Task Decomposition Patterns

The hard part isn't spawning agents; it's deciding what's independent.

### By Layer (dependency chain, serialize)

```
types → stores → routes → components
```

Changes flow downstream. Types must land before stores can consume them. Don't parallelize layers with dependencies; serialize them or have one agent do the full vertical slice.

### By File (parallel, no overlap)

```
Agent A: src/lib/sample-katas.ts
Agent B: src/lib/sample-katas-python.ts
```

Each agent owns specific files. No two agents touch the same file. This is the safest parallelization pattern.

### By Feature (parallel, independent)

```
Agent A: auth system (auth store, login page, middleware)
Agent B: payments (payment store, checkout page, API calls)
```

Independent feature slices. Works when features don't share files.

### By Language (parallel, independent)

```
Agent A: frontend TypeScript changes
Agent B: backend Rust changes
```

Natural boundary. Almost never conflicts.

### The Golden Rule

**If two agents might touch the same file, don't parallelize them.** Serialize the work or have one agent own the file and the other wait.

---

## Agent Prompt Template

Every agent prompt should include these sections:

```
ROLE: What you are (e.g., "TypeScript migration agent")

TASK: What to do
1. Specific action
2. Specific action
3. Specific action

FILES YOU OWN (only modify these):
- src/types/editor.ts
- src/stores/kata-store.ts

DO NOT TOUCH:
- Any route files
- Any component files

VALIDATION (before reporting done):
- Run: npx tsc --noEmit
- If errors in YOUR files, fix them
- If errors in OTHER files, report them but don't touch

OUTPUT: Summarize what changed and any issues found
```

Loose prompts cause drift. Agents skip steps that aren't explicit. Make constraints and validation mandatory, not optional.

---

## Validation Gates

Each agent should verify its own work before reporting done. Add this to every agent prompt:

```
Before reporting complete:
1. Run the project's type check or build command
2. If errors exist in files you own, fix them
3. If errors exist in files you don't own, report them
4. Confirm the file count and change summary
```

This catches 80% of integration issues at the source. Debugging a broken merge after all agents finish is 3x harder than catching errors per-agent.

---

## Coordination with EITS

Use EITS todos for progress tracking instead of NATS messaging. NATS requires agents to run explicit pub commands, which they often skip. EITS todos integrate naturally:

### Lead Agent Setup

```
1. Create todos with i-todo-create for each work unit
2. Spawn agents with i-spawn-agent, include parent_agent_id + parent_session_id
3. Each agent's prompt includes:
   - "Call i-todo-start <task_id> when you begin"
   - "Call i-todo-done <task_id> when complete"
   - "Call i-todo-annotate <task_id> if you hit a blocker"
4. Monitor with i-todo-list for project_id
```

### Agent Instructions (include in prompt)

```
TRACKING:
- Start: i-todo-start <task_id>
- Blocker: i-todo-annotate <task_id> "description of issue"
- Done: i-todo-done <task_id>
```

### Why Not NATS

NATS messaging works for agent-to-agent communication but fails for progress tracking because:
- Agents deprioritize non-essential instructions (progress pubs get skipped)
- No persistent state (miss a message, it's gone)
- Requires explicit numbered steps to enforce, bloating the prompt

EITS todos are persistent, queryable, and agents treat them as real work rather than side-channel noise.

---

## Merge Strategy

When agents finish, merge in dependency order:

1. **Types and interfaces first** (other code depends on them)
2. **Data layer next** (database, stores)
3. **UI layer last** (routes, components)
4. **Run full build after each merge**, not just at the end
5. If conflicts: the agent that owns the file resolves it

### Post-Merge Validation

```bash
# After all agents complete
npx tsc --noEmit          # Type check
pnpm build                # Full build
pnpm test                 # If tests exist
```

Fix any cross-agent issues in the main session, not by re-spawning agents.

---

## Model Selection

| Model | Use For | Token Budget | Speed |
|-------|---------|--------------|-------|
| haiku | Mechanical changes (type renames, find/replace with context) | ~5-15k tokens | 10-20s |
| sonnet | Balanced work (refactoring, documentation, moderate logic) | ~20-50k tokens | 30-60s |
| opus | Complex reasoning (architecture decisions, multi-file refactors) | ~50-100k tokens | 1-3 min |

**Default to haiku** for anything that doesn't require judgment. Most parallel tasks are mechanical once the plan exists.

**Watch for token waste:** If an agent burns >50k tokens on what should be a simple task, reconsider if an agent is the right tool. A 2700-line file sort should be a script, not a sonnet agent spending 90k tokens over 3 minutes.

---

## Parallel Limits

- **5 concurrent agents** is stable and performant
- **7-8** works but watch for resource contention
- **10+** causes memory pressure, exit code 137 (SIGKILL), and diminishing returns
- If you need 10+ parallel tasks, batch them: run 5, wait, run 5 more

---

## Anti-Patterns

| Anti-Pattern | Why It's Bad | Do This Instead |
|--------------|-------------|-----------------|
| LLM sorting/reordering large files | Burns 50-100k tokens for what a 10-line script does | Write a node/bash script |
| Spawning 10+ agents simultaneously | Resource contention, OOM kills | Batch in groups of 5 |
| Mixing work and reporting in one prompt | Agents skip reporting steps | Use EITS todos, keep prompts single-purpose |
| Parallelizing dependent changes | Race conditions, type errors | Serialize by dependency order |
| Validating only after all agents finish | Debugging a merged mess is painful | Each agent validates before reporting done |
| Using sonnet/opus for mechanical changes | Expensive and slow for no benefit | Use haiku for type changes, renames, simple edits |
| Two agents editing the same file | Conflicts, lost work | One file per agent, always |
| Loose prompts without file ownership | Agents wander, touch unexpected files | Explicit FILES YOU OWN / DO NOT TOUCH sections |

---

## Error Recovery

### Exit Code 137 (SIGKILL)

Process killed by OS, usually memory pressure.

- Reduce concurrent agent count
- Use haiku instead of sonnet/opus
- Break the task into smaller chunks
- Check if other heavy processes are running

### Agent Produces Wrong Output

- Don't re-run blindly; read what it actually did
- Check if the prompt was ambiguous (usually is)
- Fix the prompt, re-run with more constraints
- Or just fix it manually in the main session if it's small

### Cross-Agent Conflicts

- Identify which agent owns the conflicting file
- That agent's version wins
- Other agent re-does its work against the updated file
- Prevention is better: never assign overlapping files

---

## Example: Full Migration Workflow

Context: Migrating kata IDs from string to integer across 13 files.

```
1. Plan (main session):
   - Identify all files that reference kata IDs
   - Group by dependency: types → database → stores → routes → components
   - Identify independent work (seed data files)

2. Create EITS todos:
   - "Update type definitions" (types/editor.ts)
   - "Update database schema and seed logic" (lib/database.ts)
   - "Update stores" (stores/*.ts)
   - "Update routes and components" (routes/*.tsx, components/*.tsx)
   - "Remove id field from JS seed katas" (lib/sample-katas.ts)
   - "Remove id field from Python seed katas" (lib/sample-katas-python.ts)

3. Execute:
   - Main session: types + database + stores (dependency chain, serialize)
   - Agent A (haiku, background): Remove id from JS katas
   - Agent B (haiku, background): Remove id from Python katas
   - Main session continues: routes + components (after stores done)

4. Validate:
   - npx tsc --noEmit after each group
   - Full pnpm build at the end

5. Fix stragglers:
   - Any cross-file issues caught by build, fix in main session
```

This is 2 agents + main session, not 6 agents fighting over shared files. Parallelism where it's safe, serial where there are dependencies.
