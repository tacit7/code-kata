import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createAutosave } from "./autosave";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("createAutosave", () => {
  it("writes once after the delay, with the value read at flush time", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1500, save });

    let current = "one";
    auto.schedule(7, () => current);
    current = "two"; // typed again before the timer fired

    vi.advanceTimersByTime(1499);
    expect(save).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledExactlyOnceWith(7, "two");
  });

  // The debounce is the whole point: onChange fires per keystroke. Re-scheduling
  // the same id must not write, or every character costs an IPC + SQLite write.
  it("re-scheduling the same id resets the timer and writes nothing", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });

    auto.schedule(7, () => "a");
    vi.advanceTimersByTime(900);
    auto.schedule(7, () => "ab");
    vi.advanceTimersByTime(900);
    expect(save).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(save).toHaveBeenCalledExactlyOnceWith(7, "ab");
  });

  // The cross-kata write: the outgoing kata's code must never land under the
  // incoming kata's id.
  it("re-scheduling a different id flushes the old id first", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });

    auto.schedule(7, () => "seven's code");
    vi.advanceTimersByTime(500);
    auto.schedule(8, () => "eight's code");

    expect(save).toHaveBeenCalledExactlyOnceWith(7, "seven's code");
    expect(save).not.toHaveBeenCalledWith(8, "seven's code");

    vi.advanceTimersByTime(1000);
    expect(save).toHaveBeenCalledWith(8, "eight's code");
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("flush() writes the pending save under its own id", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });

    auto.schedule(7, () => "code");
    auto.flush();
    expect(save).toHaveBeenCalledExactlyOnceWith(7, "code");

    vi.advanceTimersByTime(5000);
    expect(save).toHaveBeenCalledTimes(1); // the timer was cleared
  });

  it("flush() with nothing pending is a no-op", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });
    auto.flush();
    auto.flush();
    expect(save).not.toHaveBeenCalled();
  });

  it("does not write when readValue returns undefined", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });
    auto.schedule(7, () => undefined);
    auto.flush();
    expect(save).not.toHaveBeenCalled();
  });

  it("cancel() drops the pending save without writing", () => {
    const save = vi.fn();
    const auto = createAutosave({ delayMs: 1000, save });
    auto.schedule(7, () => "code");
    auto.cancel();
    vi.advanceTimersByTime(5000);
    expect(save).not.toHaveBeenCalled();
  });
});
