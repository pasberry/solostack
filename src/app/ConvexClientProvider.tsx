"use client";

import { ReactNode, useSyncExternalStore } from "react";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:3000"
);

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <>{children}</>;
}

export { convex };
