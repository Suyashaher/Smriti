import { useCallback, useRef } from "react";

export function useGameTimer() {
  const startedAt = useRef(0);

  const markStart = useCallback((): void => {
    startedAt.current = performance.now();
  }, []);

  const elapsedSeconds = useCallback((): number => {
    if (startedAt.current === 0) return 0;
    return Math.round(((performance.now() - startedAt.current) / 1000) * 10) / 10;
  }, []);

  return { markStart, elapsedSeconds };
}
