export function moduleDetailsClass(nested: boolean): string {
  return nested
    ? "collapse collapse-arrow ml-4 overflow-hidden rounded-lg border border-base-300/70 bg-base-200/45 shadow-none"
    : "collapse collapse-arrow overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-md shadow-base-300/20";
}

export function moduleHeaderClass(nested: boolean): string {
  return nested
    ? "collapse-title grid w-full grid-cols-[minmax(0,1fr)_16rem] items-center gap-4 bg-base-200/70 px-4 py-2.5 pr-10 text-left transition-colors hover:bg-base-300/30"
    : "collapse-title grid w-full grid-cols-[minmax(0,1fr)_24rem] items-center gap-5 px-5 py-4 pr-12 text-left transition-colors hover:bg-base-300/20";
}

export function moduleTitleClass(nested: boolean): string {
  return nested
    ? "truncate text-base font-semibold text-base-content/85"
    : "truncate text-lg font-bold text-base-content";
}

export function moduleBodyClass(hasChildren: boolean): string {
  return hasChildren
    ? "row-start-2 col-start-1 overflow-visible bg-base-200/35"
    : "collapse-content !p-0";
}
