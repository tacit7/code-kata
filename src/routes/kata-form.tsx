import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Editor from "@monaco-editor/react";
import { useKataStore } from "../stores/kata-store";
import { useSettingsStore } from "../stores/settings-store";

export function KataFormPage() {
  const { kataId } = useParams<{ kataId: string }>();
  const isEdit = Boolean(kataId);
  const navigate = useNavigate();
  const theme = useSettingsStore((s) => s.theme);
  const katas = useKataStore((s) => s.katas);
  const createKata = useKataStore((s) => s.createKata);
  const updateKata = useKataStore((s) => s.updateKata);
  const deleteKata = useKataStore((s) => s.deleteKata);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("arrays");
  const [language, setLanguage] = useState<"javascript" | "python">("javascript");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [testCode, setTestCode] = useState("");
  const [solution, setSolution] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !kataId) return;
    const kata = katas.find((k) => k.id === Number(kataId));
    if (!kata || !kata.isCustom) {
      navigate("/library");
      return;
    }
    setName(kata.name);
    setCategory(kata.category);
    setLanguage(kata.language as "javascript" | "python");
    setDifficulty((kata.difficulty as "easy" | "medium" | "hard") ?? "easy");
    setDescription(kata.description ?? "");
    setCode(kata.code);
    setTestCode(kata.testCode);
    setSolution(kata.solution ?? "");
    setTags(kata.tags.join(", "));
  }, [isEdit, kataId, katas, navigate]);

  const existingCategories = [...new Set(katas.map((k) => k.category))].sort();

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    if (!code.trim()) { setError("Starter code is required"); return; }
    if (!testCode.trim()) { setError("Test code is required"); return; }

    setError(null);
    setSaving(true);
    try {
      const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const kataData = {
        name: name.trim(),
        category: category.trim() || "custom",
        language,
        difficulty,
        description: description.trim() || null,
        code,
        testCode,
        solution: solution.trim() || null,
        usage: null,
        tags: parsedTags,
      };

      if (isEdit && kataId) {
        await updateKata(Number(kataId), kataData);
      } else {
        await createKata(kataData);
      }
      navigate("/library");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!kataId) return;
    if (!confirm("Delete this kata? This cannot be undone.")) return;
    await deleteKata(Number(kataId));
    navigate("/library");
  };

  const monacoLang = language === "python" ? "python" : "javascript";
  const monacoTheme = theme === "dark" ? "vs-dark" : "vs";
  const editorOptions = { minimap: { enabled: false }, fontSize: 13, lineNumbers: "on" as const, scrollBeyondLastLine: false };

  const inputClass = "w-full px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500";
  const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1";

  return (
    <div className="flex flex-col h-full p-4 gap-3 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          {isEdit ? "Edit Kata" : "New Kata"}
        </h1>
        <div className="flex gap-2">
          {isEdit && (
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm rounded bg-red-600 hover:bg-red-500 text-white transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => navigate("/library")}
            className="px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm font-medium rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 text-sm rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Two Sum" />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} list="categories" placeholder="arrays" />
          <datalist id="categories">
            {existingCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className={labelClass}>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value as "javascript" | "python")} className={inputClass}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")} className={inputClass}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Tags (comma-separated)</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="array, hash-map, two-pointer" />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass + " resize-y"} placeholder="Problem description..." />
      </div>

      <div>
        <label className={labelClass}>Starter Code *</label>
        <div className="border border-zinc-300 dark:border-zinc-700 rounded overflow-hidden h-48">
          <Editor language={monacoLang} theme={monacoTheme} value={code} onChange={(v) => setCode(v ?? "")} options={editorOptions} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Test Code *</label>
        <div className="border border-zinc-300 dark:border-zinc-700 rounded overflow-hidden h-48">
          <Editor language={monacoLang} theme={monacoTheme} value={testCode} onChange={(v) => setTestCode(v ?? "")} options={editorOptions} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Solution (optional)</label>
        <div className="border border-zinc-300 dark:border-zinc-700 rounded overflow-hidden h-48">
          <Editor language={monacoLang} theme={monacoTheme} value={solution} onChange={(v) => setSolution(v ?? "")} options={editorOptions} />
        </div>
      </div>
    </div>
  );
}
