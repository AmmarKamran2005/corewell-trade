"use client";

import * as React from "react";

/* The "store" never changes — hydration happens exactly once — so subscribe is
   a no-op and the snapshots are constants. */
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` on the server and during hydration, `true` afterwards.
 *
 * Components that read something the server cannot know — the resolved colour
 * theme, `localStorage`, the viewport — must render the same output as the
 * server until hydration finishes, or React tears the tree down and warns.
 *
 * The usual `useState(false)` + `useEffect(() => setMounted(true))` does this,
 * but it sets state from an effect, which triggers a second render pass React
 * cannot batch. `useSyncExternalStore` expresses the same thing as what it
 * actually is: a value that differs between server and client.
 */
export function useIsHydrated() {
  return React.useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
