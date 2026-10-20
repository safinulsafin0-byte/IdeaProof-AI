import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * SSR-safe hook that returns true only after the component has mounted on the client.
 * Guarantees that server-side render and initial client hydration match 100% without
 * hydration mismatches or setState-in-effect cascading render warnings.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

