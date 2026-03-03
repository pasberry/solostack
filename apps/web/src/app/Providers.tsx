"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexClientProvider } from "./ConvexClientProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider
      afterSignInUrl="/"
      afterSignUpUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <ConvexProviderWithClerk>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
