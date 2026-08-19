#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const APP_ID = "com.code-kata.app";
const RELATIVE_CONTEXT_PATH = path.join("agent", "current-context.json");

function appDataDir() {
  if (process.env.KATA_AGENT_CONTEXT_PATH) return path.dirname(process.env.KATA_AGENT_CONTEXT_PATH);
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", APP_ID);
  }
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming"), APP_ID);
  }
  return path.join(process.env.XDG_DATA_HOME ?? path.join(os.homedir(), ".local", "share"), APP_ID);
}

function contextPath() {
  return process.env.KATA_AGENT_CONTEXT_PATH ?? path.join(appDataDir(), RELATIVE_CONTEXT_PATH);
}

function readContext() {
  const file = contextPath();
  if (!fs.existsSync(file)) {
    throw new Error(`No exported Kata editor context found at ${file}. Open a problem page and run "Export Agent Context" from the command palette.`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function printHelp() {
  console.log(`kata-agent - inspect the current Code Kata editor context

Usage:
  kata-agent path
  kata-agent context
  kata-agent summary
  kata-agent code
  kata-agent selection
  kata-agent tests
  kata-agent results
  kata-agent prompt

Environment:
  KATA_AGENT_CONTEXT_PATH  Override the context JSON path.
`);
}

function summary(context) {
  const lines = [
    `${context.kata.name} (${context.kata.language})`,
    `Category: ${context.kata.category}`,
    `Difficulty: ${context.kata.difficulty ?? "unknown"}`,
  ];
  if (context.kata.leetcodeNumber) lines.push(`LeetCode: #${context.kata.leetcodeNumber}`);
  if (context.kata.leetcodeUrl) lines.push(`URL: ${context.kata.leetcodeUrl}`);
  lines.push(`Session: ${context.kata.isSession ? "yes" : "no"}`);
  lines.push(`Selected code: ${context.editor.selectedCode ? "yes" : "no"}`);
  lines.push(`Latest run: ${context.latestRun.ranAt ?? "none"}`);
  return lines.join("\n");
}

function prompt(context) {
  const failed = (context.latestRun.results ?? []).filter((result) => !result.passed);
  return `You are helping a student solve a Code Kata problem. Do not reveal the full reference solution unless the user explicitly asks. Prefer hints, diagnosis, and small targeted edits.

Problem: ${context.kata.name}
Language: ${context.kata.language}
Difficulty: ${context.kata.difficulty ?? "unknown"}
${context.kata.leetcodeUrl ? `LeetCode: ${context.kata.leetcodeUrl}\n` : ""}
Description:
${context.problem.description ?? "(none)"}

Visible Test Cases:
${JSON.stringify(context.problem.visibleTestCases, null, 2)}

Student Code:
\`\`\`${context.kata.language}
${context.editor.code}
\`\`\`

Selected Code:
\`\`\`${context.kata.language}
${context.editor.selectedCode || "(none)"}
\`\`\`

Latest Failed Results:
${failed.length ? JSON.stringify(failed, null, 2) : "(none)"}

Student Notes:
${context.problem.notes || "(none)"}
`;
}

const command = process.argv[2] ?? "help";

try {
  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
  } else if (command === "path") {
    console.log(contextPath());
  } else {
    const context = readContext();
    switch (command) {
      case "context":
        console.log(JSON.stringify(context, null, 2));
        break;
      case "summary":
        console.log(summary(context));
        break;
      case "code":
        console.log(context.editor.code);
        break;
      case "selection":
        console.log(context.editor.selectedCode);
        break;
      case "tests":
        console.log(context.problem.tests);
        break;
      case "results":
        console.log(JSON.stringify(context.latestRun.results ?? [], null, 2));
        break;
      case "prompt":
        console.log(prompt(context));
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

