"use client";

import { ReactNode, useState } from "react";
import { ClerkProvider, useClerk } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Re-export convex for use in components
export { convex };
