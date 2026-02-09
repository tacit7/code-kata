import { Routes, Route } from "react-router";
import { useEditorStore } from "./stores/editor-store";
import { TopBar } from "./components/top-bar";
import { EditorPage } from "./routes/editor";

function App() {
  const theme = useEditorStore((s) => s.theme);

  return (
    <div className={`${theme === "dark" ? "dark" : ""} flex flex-col h-full`}>
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <TopBar />
        <main className="flex-1 min-h-0">
          <Routes>
            <Route path="/" element={<EditorPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
