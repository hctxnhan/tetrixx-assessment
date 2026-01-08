import { useRef, useCallback, useLayoutEffect } from 'react';

/**
 * useEffectEvent (Polyfill)
 *
 * A hook for non-reactive logic. It returns a function with a stable identity
 * that always sees the latest props and state.
 *
 * Use this to "extract" logic out of an effect when that logic should not
 * cause the effect to re-run.
 */
export function useEffectEvent<T extends (...args: any[]) => any>(callback: T | undefined): T {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  // @ts-ignore - Returning a stable function that calls the latest ref
  return useCallback((...args: any[]) => {
    return callbackRef.current?.(...args);
  }, []);
}
