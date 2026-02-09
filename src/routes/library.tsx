import { useState } from "react";
import { useNavigate } from "react-router";
import { useKataStore } from "../stores/kata-store";

export function LibraryPage() {
  const katas = useKataStore((s) => s.katas);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const q = search.toLowerCase();
  const filtered = katas.filter(
    (k) =>
      k.name.toLowerCase().includes(q) ||
      k.category.toLowerCase().includes(q) ||
      (k.difficulty?.toLowerCase().includes(q) ?? false)
  );

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search katas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 dark:focus:border-blue-400"
        />
        <button
          onClick={() => navigate("/session/setup")}
          className="px-4 py-1.5 text-sm font-medium rounded bg-green-600 hover:bg-green-500 text-white transition-colors"
        >
          Start Practice
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((kata) => (
              <tr
                key={kata.id}
                onClick={() => navigate(`/editor/${kata.id}`)}
                className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
              >
                <td className="py-2 font-medium">{kata.name}</td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">{kata.category}</td>
                <td className="py-2">
                  <span className="px-1.5 py-0.5 text-xs rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {kata.difficulty ?? "—"}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-zinc-400">
                  No katas found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
