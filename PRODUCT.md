# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers practicing algorithm and React/UI patterns for interview preparation or daily skill maintenance. The primary user is already comfortable with code and wants a focused practice tool rather than a general-purpose IDE.

## Product Purpose

Code Kata Python is a local desktop kata trainer for timed coding practice. It brings kata discovery, Monaco editing, in-app tests, session flow, progress history, and analytics into one application so users can practice deliberately without switching between repositories, terminals, and tracking documents.

## Positioning

The product is a focused local practice environment: curated kata roadmaps, JS and Python practice, in-app worker-based test execution, session state, local SQLite progress, and editor ergonomics live together without depending on a cloud service.

## Operating Context

Users browse problems and modules, start practice sessions, solve one kata at a time in the embedded editor, run tests in-app, review solutions or variants, and use dashboards/results history to decide what to practice next. Practice sessions are resumable, and settings preserve editor, language, queue, and workflow preferences.

## Capabilities and Constraints

The app is a Tauri v2 desktop application with a React 19 and TypeScript frontend, Monaco editor, Tailwind CSS and daisyUI styling, Zustand state, Recharts analytics, and local SQLite storage through Tauri plugins. The current product variant in this repository supports JavaScript and Python kata content; Python runs through Pyodide in a Web Worker. The repo's retired Ruby variant must not be recreated here.

LeetCode-backed kata metadata is structured, but bundled problem descriptions must remain original and paraphrased rather than verbatim LeetCode text. Existing local user data, saved code, notes, sessions, attempts, presets, and settings are product facts future work should preserve.

## Brand Commitments

The product name in the current Tauri configuration is Code Kata Python. Existing app icons and logos follow the Code Kata family style: a white square background, CK mark, and language badge. The incumbent interface is an editor-oriented desktop tool with dark and light themes, compact navigation, and practice-first terminology.

## Evidence on Hand

Primary evidence lives in `PRD_kata_desktop.md`, `AGENTS.md`, `package.json`, `src/App.tsx`, `src/index.css`, `src/lib/database.ts`, `src/routes/practice.tsx`, `src/routes/library.tsx`, `src/routes/dashboard.tsx`, and `src-tauri/tauri.conf.json`.

The repository does not contain confirmed testimonials, external customer proof, pricing, licensing claims, or cloud service claims; future design work should not fabricate them.

## Product Principles

Keep practice flow faster than setup.

Prefer local, resilient workflows that work without cloud accounts.

Treat kata content, progress data, and user code as durable learning records.

Make the interface dense enough for repeated expert use while keeping practice decisions easy to scan.

Preserve language-specific constraints and cross-language content consistency where the project maintains multiple language apps.
