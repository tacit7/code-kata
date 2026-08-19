import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Editor from "@monaco-editor/react";
import { monacoReady } from "../lib/monaco-setup";
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
  const [language, setLanguage] = useState<"javascript" | "python" | "java">("javascript");
  const [monacoUp, setMonacoUp] = useState(false);
  useEffect(() => {
    void monacoReady.then(() => setMonacoUp(true));
  }, []);
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
      navigate("/problems");
      return;
    }
    setName(kata.name);
    setCategory(kata.category);
    setLanguage(kata.language as "javascript" | "python" | "java");
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
      navigate("/problems");
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
    navigate("/problems");
  };

  const monacoLang = language === "python" ? "python" : language === "java" ? "java" : "javascript";
  const monacoTheme = theme === "dark" ? "vs-dark" : "vs";
  const editorOptions = { minimap: { enabled: false }, fontSize: 13, lineNumbers: "on" as const, scrollBeyondLastLine: false };

  if (!monacoUp) return null;

  return (
    <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">
          {isEdit ? "Edit Kata" : "New Kata"}
        </h1>
        <div className="flex gap-2">
          {isEdit && (
            <button
              onClick={handleDelete}
              className="btn btn-error btn-sm"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => navigate("/problems")}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary btn-sm"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input input-bordered input-sm w-full bg-base-100" placeholder="Two Sum" />
        </div>
        <div>
          <label className="label text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input input-bordered input-sm w-full bg-base-100" list="categories" placeholder="arrays" />
          <datalist id="categories">
            {existingCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className="label text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value as "javascript" | "python" | "java")} className="select select-bordered select-sm w-full bg-base-100">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>
        <div>
          <label className="label text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")} className="select select-bordered select-sm w-full bg-base-100">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Tags (comma-separated)</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="input input-bordered input-sm w-full bg-base-100" placeholder="array, hash-map, two-pointer" />
      </div>

      <div>
        <label className="label text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="textarea textarea-bordered w-full bg-base-100 resize-y text-sm" placeholder="Problem description..." />
      </div>

      <div>
        <label className="label text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Starter Code *</label>
        <div className="border border-base-300/50 rounded-lg overflow-hidden h-48">
          <Editor language={monacoLang} theme={monacoTheme} value={code} onChange={(v) => setCode(v ?? "")} options={editorOptions} />
        </div>
      </div>

      <div>
        <label className="label text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Test Code *</label>
        <div className="border border-base-300/50 rounded-lg overflow-hidden h-48">
          <Editor language={monacoLang} theme={monacoTheme} value={testCode} onChange={(v) => setTestCode(v ?? "")} options={editorOptions} />
        </div>
      </div>

      <div>
        <label className="label text-[11px] font-semibold text-base-content/35 uppercase tracking-wider">Solution (optional)</label>
        <div className="border border-base-300/50 rounded-lg overflow-hidden h-48">
          <Editor language={monacoLang} theme={monacoTheme} value={solution} onChange={(v) => setSolution(v ?? "")} options={editorOptions} />
        </div>
      </div>
    </div>
  );
}
