import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { useSettingsStore, type KataLanguage } from "../stores/settings-store";
import { useKataStore } from "../stores/kata-store";
import { toast } from "../stores/toast-store";

export function ResultProblemLink({ kataId, language, children }: {
  kataId: number;
  language: string;
  children: ReactNode;
}) {
  const selectedLanguage = useSettingsStore((state) => state.language);
  const setSetting = useSettingsStore((state) => state.setSetting);
  const loadKatas = useKataStore((state) => state.loadKatas);
  const navigate = useNavigate();
  const path = `/editor/${kataId}`;

  return (
    <Link to={path} className="font-medium text-left hover:text-primary hover:underline transition-colors"
      onClick={async (event) => {
        event.stopPropagation();
        if (language === selectedLanguage) return;
        event.preventDefault();
        try {
          await setSetting("language", language as KataLanguage, { throwOnError: true });
          await loadKatas(language);
          navigate(path);
        } catch (error) {
          toast.error(`Could not open problem: ${error instanceof Error ? error.message : String(error)}`);
        }
      }}
    >
      {children}
    </Link>
  );
}
