import { APP_VARIANT } from "../lib/app-variant";
import { useMemo, useState } from "react";
import { KataEditor } from "../components/kata-editor";
import { scratchpadKata, type ScratchpadLanguage } from "../lib/scratchpad";
import { useSettingsStore } from "../stores/settings-store";

export function ScratchpadPage() {
  const preferredLanguage = useSettingsStore((state) => state.language);
  const [language, setLanguage] = useState<ScratchpadLanguage>(
    preferredLanguage === "javascript" ? "javascript" : APP_VARIANT.primaryLanguage,
  );
  const kata = useMemo(() => scratchpadKata(language), [language]);

  return <KataEditor key={language} kata={kata} scratchpad={{ onLanguageChange: setLanguage }} />;
}
