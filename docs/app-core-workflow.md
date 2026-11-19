# Shared frontend workflow

Shared editor, assistant, scratchpad, practice, results, navigation, and dashboard
features are authored and committed on `app-core`. Merge `app-core` outward
into both products. Keep the flow one way.

Python is the Tauri product in this repository. Ruby is the Electron product in
`~/projects/ruby-kata`, whose `core` remote points to this repository.

## Platform and language boundaries

The common frontend imports native operations from `src/lib/native-api.ts`.
Each product owns `native-api-platform.ts`, which implements that contract.
`app-variant.ts` supplies product identity and available languages.

These product-owned files also stay outside the shared-file manifest.

- Native main/preload/Rust code and packaging configuration
- Database initialization, content seeds, LeetCode mappings, DP content metadata, and language-specific migrations
- Language test runners, workers, and `repl-backends.ts`
- Renderer bootstrap and router selection

The empty `app-core` REPL registry remains untouched. Register Python or Ruby
only in its product. Ruby stays an Electron application.

Shared session migrations live in `session-schema.ts`; each database initializer
calls them after creating its base tables. Existing problem IDs and progress
belong to the product database.

## Deliver a shared feature

1. Implement and commit the frontend change on `app-core`.
2. Merge `app-core` into the Python product branch and resolve product-owned
   adapters and content imports there.
3. In Ruby, run `git fetch core app-core` and merge `core/app-core`. Resolve
   Electron adapters and Ruby content there.
4. Run `pnpm check:shared` in Python and
   `pnpm check:shared -- --ref core/app-core` in Ruby.
5. Run `pnpm test` and `pnpm build` in both products. Run
   `pnpm verify-katas` in Ruby when its runner, content, or database changes.
6. Check the affected UI through both native applications before publishing.

The parity check verifies merge ancestry and the exact contents of the files in
`docs/shared-frontend-files.json`. Add new shared files to that manifest in the
same `app-core` commit. A deliberate product-specific implementation belongs
behind an adapter, with the shared interface kept on `app-core`.

From Python, `pnpm check:shared -- --peer ~/projects/ruby-kata` checks both
checkouts against the same local `app-core` commit.
