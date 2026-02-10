import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useKataStore } from "../stores/kata-store";
import { useSessionStore, selectRandomKatas } from "../stores/session-store";
import { useSettingsStore } from "../stores/settings-store";
import { useTimerStore } from "../stores/timer-store";
import type { SessionType } from "../types/editor";

type Tab = "daily" | "random" | "custom";
const SIZE_OPTIONS = [5, 10, 15, 20];

export function SessionSetupPage() {
  const navigate = useNavigate();
  const katas = useKataStore((s) => s.katas);
  const { startSession, loadPresets, presets, savePreset, deletePreset } = useSessionStore();
  const startSessionTimer = useTimerStore((s) => s.startSessionTimer);
  const resetKataTimer = useTimerStore((s) => s.resetKataTimer);
  const dailyKataIds = useSettingsStore((s) => s.dailyKataIds);
  const setSetting = useSettingsStore((s) => s.setSetting);

  const [tab, setTab] = useState<Tab>("daily");
  const [size, setSize] = useState(5);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customOrder, setCustomOrder] = useState<string[]>([]);
  const [presetName, setPresetName] = useState("");
  const [starting, setStarting] = useState(false);

  // Daily tab local state
  const [dailySelectedIds, setDailySelectedIds] = useState<Set<string>>(new Set());
  const [dailySaved, setDailySaved] = useState(false);

  const categories = [...new Set(katas.map((k) => k.category))].sort();
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  // Sync daily tab selection from persisted dailyKataIds
  useEffect(() => {
    setDailySelectedIds(new Set(dailyKataIds));
  }, [dailyKataIds]);

  const filteredKatas = categoryFilter
    ? katas.filter((k) => k.category === categoryFilter)
    : katas;

  const toggleKata = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
      setCustomOrder((prev) => prev.filter((i) => i !== id));
    } else {
      next.add(id);
      setCustomOrder((prev) => [...prev, id]);
    }
    setSelectedIds(next);
  };

  const toggleDailyKata = (id: string) => {
    const next = new Set(dailySelectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setDailySelectedIds(next);
    setDailySaved(false);
  };

  const handleSaveDailySet = async () => {
    const ids = [...dailySelectedIds];
    await setSetting("dailyKataIds", ids);
    setDailySaved(true);
    setTimeout(() => setDailySaved(false), 2000);
  };

  const moveUp = (id: string) => {
    setCustomOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (id: string) => {
    setCustomOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const loadPreset = (presetId: number) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    const ids = new Set(preset.kataIds);
    setSelectedIds(ids);
    setCustomOrder(preset.kataIds);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim() || customOrder.length === 0) return;
    await savePreset(presetName.trim(), customOrder);
    setPresetName("");
  };

  const handleStart = useCallback(async () => {
    if (starting) return;
    setStarting(true);

    let sessionType: SessionType;
    let selectedKatas;

    if (tab === "daily") {
      sessionType = "daily";
      const kataMap = new Map(katas.map((k) => [k.id, k]));
      const ids = [...dailySelectedIds];
      selectedKatas = ids.map((id) => kataMap.get(id)).filter(Boolean) as typeof katas;
    } else if (tab === "random") {
      sessionType = "random";
      selectedKatas = selectRandomKatas(filteredKatas, size);
    } else {
      sessionType = "custom";
      const kataMap = new Map(katas.map((k) => [k.id, k]));
      selectedKatas = customOrder.map((id) => kataMap.get(id)).filter(Boolean) as typeof katas;
    }

    if (selectedKatas.length === 0) {
      setStarting(false);
      return;
    }

    resetKataTimer();
    startSessionTimer();
    const sessionId = await startSession(sessionType, selectedKatas);
    navigate(`/session/${sessionId}`);
  }, [
    starting, tab, size, filteredKatas, customOrder, katas, dailySelectedIds,
    startSession, startSessionTimer, resetKataTimer, navigate,
  ]);

  const tabClass = (t: Tab) =>
    `px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
      tab === t
        ? "border-blue-500 text-blue-600 dark:text-blue-400"
        : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
    }`;

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto">
      <h1 className="text-lg font-semibold">Start Practice Session</h1>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700">
        <button onClick={() => setTab("daily")} className={tabClass("daily")}>Daily</button>
        <button onClick={() => setTab("random")} className={tabClass("random")}>Random</button>
        <button onClick={() => setTab("custom")} className={tabClass("custom")}>Custom</button>
      </div>

      <div className="flex-1 min-h-0">
        {/* Daily tab — user-curated kata picker */}
        {tab === "daily" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Selected ({dailySelectedIds.size})
              </p>
              <button
                onClick={handleSaveDailySet}
                disabled={dailySelectedIds.size === 0}
                className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition-colors"
              >
                {dailySaved ? "Saved!" : "Save as Daily Set"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-96 border border-zinc-200 dark:border-zinc-800 rounded p-2">
              {katas.map((k) => (
                <label key={k.id} className="flex items-center gap-2 py-1 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-1 rounded">
                  <input
                    type="checkbox"
                    checked={dailySelectedIds.has(k.id)}
                    onChange={() => toggleDailyKata(k.id)}
                    className="rounded"
                  />
                  <span className="flex-1">{k.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{k.category}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{k.difficulty}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Random tab */}
        {tab === "random" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Number of katas
              </label>
              <div className="flex gap-2">
                {SIZE_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setSize(n)}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      size === n
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Category filter (optional)
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Randomly shuffles and picks from available katas. Available: {filteredKatas.length} katas.
            </p>
          </div>
        )}

        {/* Custom tab */}
        {tab === "custom" && (
          <div className="flex flex-col gap-3">
            {/* Preset controls */}
            <div className="flex items-center gap-2">
              {presets.length > 0 && (
                <select
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val) loadPreset(val);
                  }}
                  defaultValue=""
                  className="px-2 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="" disabled>Load preset...</option>
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.kataIds.length})</option>
                  ))}
                </select>
              )}
              {presets.length > 0 && (
                <button
                  onClick={() => {
                    const sel = presets[0]; // delete first selected; user can pick
                    if (sel) deletePreset(sel.id);
                  }}
                  className="px-2 py-1 text-xs rounded bg-red-600/20 text-red-400 hover:bg-red-600/30"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Save preset */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="px-2 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 w-48"
              />
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim() || customOrder.length === 0}
                className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition-colors"
              >
                Save Preset
              </button>
            </div>

            {/* Selected order */}
            {customOrder.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Selected ({customOrder.length}):
                </p>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                  {customOrder.map((id, i) => {
                    const k = katas.find((k) => k.id === id);
                    if (!k) return null;
                    return (
                      <div key={id} className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400 w-5 text-right">{i + 1}.</span>
                        <span className="flex-1">{k.name}</span>
                        <button onClick={() => moveUp(id)} className="text-xs text-zinc-500 hover:text-zinc-300" disabled={i === 0}>Up</button>
                        <button onClick={() => moveDown(id)} className="text-xs text-zinc-500 hover:text-zinc-300" disabled={i === customOrder.length - 1}>Dn</button>
                        <button onClick={() => toggleKata(id)} className="text-xs text-red-400 hover:text-red-300">X</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kata checklist */}
            <div className="flex-1 overflow-y-auto max-h-64 border border-zinc-200 dark:border-zinc-800 rounded p-2">
              {katas.map((k) => (
                <label key={k.id} className="flex items-center gap-2 py-1 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(k.id)}
                    onChange={() => toggleKata(k.id)}
                    className="rounded"
                  />
                  <span className="flex-1">{k.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{k.category}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{k.difficulty}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={starting || (tab === "daily" && dailySelectedIds.size === 0) || (tab === "custom" && customOrder.length === 0)}
        className="self-start px-6 py-2 text-sm font-medium rounded bg-green-600 hover:bg-green-500 text-white disabled:opacity-40 transition-colors"
      >
        {starting ? "Starting..." : "Start Session"}
      </button>
    </div>
  );
}
