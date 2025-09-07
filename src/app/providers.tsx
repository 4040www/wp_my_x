"use client";

import { SessionProvider } from "next-auth/react";
import SWRProvider from "@/components/SWRProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRProvider>
        {children}
      </SWRProvider>
    </SessionProvider>
  );
}
