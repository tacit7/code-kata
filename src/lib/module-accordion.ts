export function moduleBodyClass(hasChildren: boolean): string {
  return hasChildren
    ? "row-start-2 col-start-1 overflow-visible bg-base-200/40"
    : "collapse-content !p-0";
}
