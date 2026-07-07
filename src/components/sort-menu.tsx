import { useEffect, useRef, useState } from "react";
import type { LibrarySortField, SortDirection } from "../stores/kata-store";

export interface SortOption {
  field: LibrarySortField;
  label: string;
  /** Supports asc/desc toggling on repeat clicks; non-toggle options just select. */
  toggle: boolean;
}

interface SortMenuProps {
  options: SortOption[];
  field: LibrarySortField;
  dir: SortDirection;
  onChange: (field: LibrarySortField, dir: SortDirection) => void;
}

export function SortMenu({ options, field, dir, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const active = options.find((o) => o.field === field);

  function selectOption(opt: SortOption) {
    if (opt.toggle && field === opt.field) {
      onChange(opt.field, dir === "asc" ? "desc" : "asc");
    } else {
      onChange(opt.field, "asc");
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="select select-bordered select-sm bg-base-100 text-xs flex items-center gap-1 justify-between"
      >
        <span>Sort: {active?.label ?? "Default"}</span>
        {active?.toggle && (
          <span className="text-base-content/50">{dir === "asc" ? "▲" : "▼"}</span>
        )}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 w-56 rounded-lg border border-base-300/50 bg-base-100 shadow-lg py-1.5 flex flex-col">
          {options.map((opt) => {
            const isActive = opt.field === field;
            return (
              <button
                key={opt.field}
                onClick={() => selectOption(opt)}
                className={`flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                  isActive ? "bg-base-300/40 text-base-content" : "text-base-content/70 hover:bg-base-300/20"
                }`}
              >
                <span>{opt.label}</span>
                {isActive && (
                  opt.toggle
                    ? <span className="text-base-content/50">{dir === "asc" ? "▲" : "▼"}</span>
                    : <span className="text-base-content/50">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
