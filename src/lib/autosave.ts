// A debounced save that flushes rather than drops when the thing being saved
// changes identity.
//
// kata-editor.tsx used to clearTimeout() the pending save on kata change, which
// silently discarded the last 1500ms of typing. Flushing naively would be worse:
// by cleanup time the component's `kata` already points at the NEXT kata, so the
// outgoing code would be written under the incoming id. The pending id is
// therefore captured at schedule time and never re-read.

export interface AutosaveOptions<Id> {
  delayMs: number;
  save: (id: Id, value: string) => void;
}

export interface Autosave<Id> {
  /** `readValue` runs at flush time, so the save always writes the latest text. */
  schedule(id: Id, readValue: () => string | undefined): void;
  flush(): void;
  cancel(): void;
}

interface Pending<Id> {
  id: Id;
  readValue: () => string | undefined;
}

export function createAutosave<Id>({ delayMs, save }: AutosaveOptions<Id>): Autosave<Id> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Pending<Id> | null = null;

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function flush() {
    clearTimer();
    if (pending === null) return;

    const { id, readValue } = pending;
    pending = null;

    const value = readValue();
    if (value !== undefined) save(id, value);
  }

  function schedule(id: Id, readValue: () => string | undefined) {
    // Same id: a plain debounce. onChange fires per keystroke, so flushing here
    // would mean one write per character.
    // Different id: the outgoing kata is about to lose its only chance to save.
    if (pending !== null && pending.id !== id) flush();

    pending = { id, readValue };
    clearTimer();
    timer = setTimeout(flush, delayMs);
  }

  function cancel() {
    clearTimer();
    pending = null;
  }

  return { schedule, flush, cancel };
}
