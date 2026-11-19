import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import {
  BarChart3,
  Code2,
  Dumbbell,
  FilePlus,
  FolderTree,
  History,
  Search,
  Settings,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCommandPaletteStore, type CommandPaletteAction } from "../stores/command-palette-store";
import { useSettingsStore } from "../stores/settings-store";

function formatCombo(combo: string | undefined): string | null {
  if (!combo) return null;
  return combo
    .split("+")
    .map((part) => {
      switch (part) {
        case "Meta":
          return "⌘";
        case "Ctrl":
          return "Ctrl";
        case "Alt":
          return "⌥";
        case "Shift":
          return "⇧";
        case "ArrowRight":
          return "→";
        case "ArrowLeft":
          return "←";
        case "Escape":
          return "Esc";
        case "=":
          return "+";
        default:
          return part;
      }
    })
    .join(" ");
}

const SECTION_ORDER = ["Navigation", "Katas", "Practice", "Editor", "Templates", "View"];

function sectionRank(section: string): number {
  const index = SECTION_ORDER.indexOf(section);
  return index === -1 ? SECTION_ORDER.length : index;
}

function commandValue(action: CommandPaletteAction): string {
  return [
    action.title,
    action.subtitle,
    action.section,
    ...(action.keywords ?? []),
  ].filter(Boolean).join(" ");
}

function normalizedSearch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isTemplateSearch(value: string): boolean {
  return /^cs(?:\s|$)/.test(normalizedSearch(value));
}

export function templateSearchValue(value: string): string {
  return normalizedSearch(value).replace(/^cs(?:\s+|$)/, "");
}

function actionMatchesSearch(action: CommandPaletteAction, value: string): boolean {
  const query = normalizedSearch(value);
  if (!query) return true;

  const terms = query.split(" ").filter(Boolean);
  const haystack = commandValue(action).toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function CommandPalette() {
  const open = useCommandPaletteStore((s) => s.open);
  const setOpen = useCommandPaletteStore((s) => s.setOpen);
  const registeredActions = useCommandPaletteStore((s) => s.registeredActions);
  const shortcuts = useSettingsStore((s) => s.shortcuts);
  const [search, setSearch] = useState("");

  const actions = useMemo(() => {
    const templateMode = isTemplateSearch(search);
    const effectiveSearch = templateMode ? templateSearchValue(search) : search;

    return Object.values(registeredActions).filter((action) => {
      if (action.hidden) return false;
      if (templateMode && action.section !== "Templates") return false;
      return actionMatchesSearch(action, effectiveSearch);
    }).sort((a, b) => {
      const sectionDiff = sectionRank(a.section ?? "Other") - sectionRank(b.section ?? "Other");
      return sectionDiff || a.title.localeCompare(b.title);
    });
  }, [registeredActions, search]);

  const grouped = useMemo(() => {
    const groups = new Map<string, CommandPaletteAction[]>();
    for (const action of actions) {
      const section = action.section ?? "Other";
      groups.set(section, [...(groups.get(section) ?? []), action]);
    }
    return [...groups.entries()];
  }, [actions]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-base-300/35 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <Command
        label="Command Palette"
        shouldFilter={false}
        className="w-full max-w-2xl overflow-hidden rounded-lg border border-base-300/80 bg-base-100 shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-base-300/70 px-3 py-2.5">
          <Search size={18} className="text-base-content/35" />
          <Command.Input
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder={isTemplateSearch(search) ? "Search templates..." : "Type a command or search..."}
            className="h-8 flex-1 bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
          />
          {formatCombo(shortcuts.openCommandPalette) && (
            <kbd className="rounded border border-base-300/70 bg-base-200 px-1.5 py-0.5 text-[10px] text-base-content/45">
              {formatCombo(shortcuts.openCommandPalette)}
            </kbd>
          )}
        </div>
        <Command.List className="max-h-[56vh] overflow-y-auto p-2">
          {grouped.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-base-content/35">
              No commands found.
            </div>
          ) : grouped.map(([section, sectionActions]) => (
            <Command.Group
              key={section}
              heading={section}
              className="pb-1 text-[11px] font-semibold uppercase tracking-wider text-base-content/35 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
            >
              {sectionActions.map((action) => {
                const shortcut = formatCombo(action.shortcut);
                return (
                  <Command.Item
                    key={action.id}
                    value={commandValue(action)}
                    keywords={action.keywords}
                    disabled={action.disabled}
                    onSelect={() => {
                      if (action.disabled) return;
                      setOpen(false);
                      void action.run();
                    }}
                    className="flex cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm text-base-content/75 outline-none aria-disabled:opacity-35 data-[selected=true]:bg-primary/12 data-[selected=true]:text-base-content"
                  >
                    <CommandIcon action={action} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{action.title}</div>
                      {action.subtitle && (
                        <div className="truncate text-xs font-normal text-base-content/38">{action.subtitle}</div>
                      )}
                    </div>
                    {shortcut && (
                      <kbd className="shrink-0 rounded border border-base-300/70 bg-base-200 px-1.5 py-0.5 text-[10px] text-base-content/45">
                        {shortcut}
                      </kbd>
                    )}
                  </Command.Item>
                );
              })}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}

function CommandIcon({ action }: { action: CommandPaletteAction }) {
  const iconClass = "h-4 w-4 shrink-0 text-base-content/38";
  if (action.id.startsWith("practice:")) return <Dumbbell className={iconClass} />;
  if (action.id.includes("settings")) return <Settings className={iconClass} />;
  if (action.id.includes("new-kata")) return <FilePlus className={iconClass} />;
  if (action.id.includes("zoom-in")) return <ZoomIn className={iconClass} />;
  if (action.id.includes("zoom-out")) return <ZoomOut className={iconClass} />;
  if (action.id.includes("dashboard")) return <BarChart3 className={iconClass} />;
  if (action.id.includes("modules")) return <FolderTree className={iconClass} />;
  if (action.id.includes("results")) return <History className={iconClass} />;
  return <Code2 className={iconClass} />;
}
