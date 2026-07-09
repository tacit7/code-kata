import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

interface Options {
  intervalMs: number;
  out: string | null;
  once: boolean;
  pid: number | null;
  cpuThreshold: number;
  rssThresholdMb: number;
  includeAllWebKit: boolean;
}

interface ProcessRow {
  pid: number;
  ppid: number;
  cpu: number;
  rssKb: number;
  vszKb: number;
  elapsed: string;
  command: string;
}

interface Sample {
  sampledAt: string;
  rows: ProcessRow[];
  spikes: ProcessRow[];
}

const DEFAULT_OPTIONS: Options = {
  intervalMs: 2_000,
  out: "tmp/tauri-process-monitor.jsonl",
  once: false,
  pid: null,
  cpuThreshold: 150,
  rssThresholdMb: 1_024,
  includeAllWebKit: false,
};

function usage(): never {
  console.log(`Usage: pnpm monitor:tauri [options]

Options:
  --pid <pid>             Focus on a known Tauri host PID and its process tree.
  --interval <seconds>    Sampling interval. Default: 2.
  --out <path>            JSONL output path. Default: tmp/tauri-process-monitor.jsonl.
  --no-out                Print only; do not write JSONL.
  --once                  Capture one sample and exit.
  --cpu <percent>         Mark CPU spikes at/above this percent. Default: 150.
  --rss <mb>              Mark RSS spikes at/above this many MB. Default: 1024.
  --all-webkit            Include every Apple WebKit helper process.
  --help                  Show this help.
`);
  process.exit(0);
}

function parseArgs(argv: string[]): Options {
  const options = { ...DEFAULT_OPTIONS };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value) throw new Error(`${arg} requires a value`);
      return value;
    };

    if (arg === "--help" || arg === "-h") usage();
    else if (arg === "--pid") options.pid = Number(next());
    else if (arg === "--interval") options.intervalMs = Number(next()) * 1_000;
    else if (arg === "--out") options.out = next();
    else if (arg === "--no-out") options.out = null;
    else if (arg === "--once") options.once = true;
    else if (arg === "--cpu") options.cpuThreshold = Number(next());
    else if (arg === "--rss") options.rssThresholdMb = Number(next());
    else if (arg === "--all-webkit") options.includeAllWebKit = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  if (options.pid !== null && (!Number.isFinite(options.pid) || options.pid <= 0)) {
    throw new Error("--pid must be a positive process id");
  }
  if (!Number.isFinite(options.intervalMs) || options.intervalMs < 250) {
    throw new Error("--interval must be at least 0.25 seconds");
  }
  if (!Number.isFinite(options.cpuThreshold) || options.cpuThreshold < 0) {
    throw new Error("--cpu must be a non-negative number");
  }
  if (!Number.isFinite(options.rssThresholdMb) || options.rssThresholdMb < 0) {
    throw new Error("--rss must be a non-negative number");
  }

  return options;
}

function parsePs(stdout: string): ProcessRow[] {
  return stdout
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const match = line.trim().match(/^(\d+)\s+(\d+)\s+([\d.]+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(.+)$/);
      if (!match) return null;
      return {
        pid: Number(match[1]),
        ppid: Number(match[2]),
        cpu: Number(match[3]),
        rssKb: Number(match[4]),
        vszKb: Number(match[5]),
        elapsed: match[6],
        command: match[7],
      };
    })
    .filter((row): row is ProcessRow => row !== null);
}

async function readProcesses(): Promise<ProcessRow[]> {
  const { stdout } = await execFileAsync("ps", [
    "-axo",
    "pid=,ppid=,%cpu=,rss=,vsz=,etime=,command=",
  ]);
  return parsePs(`PID PPID %CPU RSS VSZ ELAPSED COMMAND\n${stdout}`);
}

function isTauriRelated(row: ProcessRow): boolean {
  return /\btarget\/debug\/app\b/.test(row.command)
    || /\btarget\/release\/app\b/.test(row.command)
    || /pnpm tauri dev/.test(row.command)
    || /tauri\.js dev/.test(row.command)
    || /\bvite\/bin\/vite\.js\b/.test(row.command)
    || /\bVITE\b/.test(row.command);
}

function isWebKit(row: ProcessRow): boolean {
  return /com\.apple\.WebKit|WebKit\.framework/.test(row.command);
}

function elapsedSeconds(value: string): number | null {
  const daySplit = value.split("-");
  const daySeconds = daySplit.length === 2 ? Number(daySplit[0]) * 86_400 : 0;
  const time = daySplit.length === 2 ? daySplit[1] : daySplit[0];
  const parts = time.split(":").map(Number);

  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 2) return daySeconds + parts[0] * 60 + parts[1];
  if (parts.length === 3) return daySeconds + parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function startedNear(a: ProcessRow, b: ProcessRow, toleranceSeconds: number): boolean {
  const aElapsed = elapsedSeconds(a.elapsed);
  const bElapsed = elapsedSeconds(b.elapsed);
  if (aElapsed === null || bElapsed === null) return false;
  return Math.abs(aElapsed - bElapsed) <= toleranceSeconds;
}

function descendantsOf(rows: ProcessRow[], rootPid: number): Set<number> {
  const byParent = new Map<number, ProcessRow[]>();
  for (const row of rows) {
    const siblings = byParent.get(row.ppid) ?? [];
    siblings.push(row);
    byParent.set(row.ppid, siblings);
  }

  const seen = new Set<number>([rootPid]);
  const queue = [rootPid];
  while (queue.length > 0) {
    const parent = queue.shift()!;
    for (const child of byParent.get(parent) ?? []) {
      if (seen.has(child.pid)) continue;
      seen.add(child.pid);
      queue.push(child.pid);
    }
  }
  return seen;
}

function selectRows(rows: ProcessRow[], options: Options): ProcessRow[] {
  const appPid = options.pid
    ?? rows.find((row) => /\btarget\/debug\/app\b|\btarget\/release\/app\b/.test(row.command))?.pid
    ?? null;
  const appRow = appPid ? rows.find((row) => row.pid === appPid) ?? null : null;
  const tree = appPid ? descendantsOf(rows, appPid) : new Set<number>();
  const tauriParents = new Set(rows.filter(isTauriRelated).map((row) => row.pid));

  return rows
    .filter((row) => {
      if (options.pid !== null && tree.has(row.pid)) return true;
      if (options.pid !== null && row.pid === options.pid) return true;
      if (isTauriRelated(row)) return true;
      if (tree.has(row.pid)) return true;
      if (tauriParents.has(row.ppid)) return true;
      if (appRow && isWebKit(row) && startedNear(row, appRow, 120)) return true;
      if (options.includeAllWebKit && isWebKit(row)) return true;
      return false;
    })
    .sort((a, b) => b.cpu - a.cpu || b.rssKb - a.rssKb);
}

function formatMb(kb: number): string {
  return `${(kb / 1024).toFixed(1)}MB`;
}

function printSample(sample: Sample): void {
  console.clear();
  console.log(`Tauri process monitor ${sample.sampledAt}`);
  console.log("PID     PPID    CPU%    RSS       VSZ       ELAPSED   COMMAND");
  for (const row of sample.rows) {
    const command = row.command.length > 110 ? `${row.command.slice(0, 107)}...` : row.command;
    console.log(
      `${String(row.pid).padEnd(7)} ${String(row.ppid).padEnd(7)} ${row.cpu.toFixed(1).padStart(6)}  ${formatMb(row.rssKb).padStart(8)}  ${formatMb(row.vszKb).padStart(8)}  ${row.elapsed.padEnd(8)}  ${command}`,
    );
  }

  if (sample.spikes.length > 0) {
    console.log("\nSpikes:");
    for (const row of sample.spikes) {
      console.log(`- pid ${row.pid}: cpu=${row.cpu.toFixed(1)} rss=${formatMb(row.rssKb)} command=${row.command}`);
    }
  }
}

async function appendSample(path: string, sample: Sample): Promise<void> {
  const absolute = resolve(path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(sample)}\n`, { flag: "a" });
}

async function capture(options: Options): Promise<void> {
  const rows = selectRows(await readProcesses(), options);
  const rssThresholdKb = options.rssThresholdMb * 1024;
  const sample: Sample = {
    sampledAt: new Date().toISOString(),
    rows,
    spikes: rows.filter((row) => row.cpu >= options.cpuThreshold || row.rssKb >= rssThresholdKb),
  };

  printSample(sample);
  if (options.out) await appendSample(options.out, sample);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (options.out) {
    console.log(`Writing JSONL samples to ${resolve(options.out)}`);
  }
  console.log("Press Ctrl+C to stop.");

  await capture(options);
  if (options.once) return;

  setInterval(() => {
    capture(options).catch((err) => {
      console.error(err instanceof Error ? err.message : String(err));
    });
  }, options.intervalMs);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
