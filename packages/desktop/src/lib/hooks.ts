// packages/desktop/src/lib/hooks.ts
import { useEffect, useRef } from "react";

// Runs fn immediately, then every intervalMs while mounted. Guards against
// overlapping invocations if fn is slower than the interval.
export function usePoller(fn: () => void | Promise<void>, intervalMs: number, deps: unknown[] = []) {
  const running = useRef(false);
  useEffect(() => {
    let stopped = false;
    const tick = async () => {
      if (running.current || stopped) return;
      running.current = true;
      try {
        await fn();
      } catch {
        // errors are logged inside fn where relevant
      } finally {
        running.current = false;
      }
    };
    void tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      stopped = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
