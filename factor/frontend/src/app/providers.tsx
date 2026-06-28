"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const Web3Providers = dynamic(
  () => import("@zama-season3/shared").then((m) => m.Web3Providers),
  {
    ssr: false,
    loading: () => (
      <div className="factor-boot" role="status">
        Initializing wallet layer…
      </div>
    ),
  },
);

export function AppProviders({ children }: { children: ReactNode }) {
  return <Web3Providers>{children}</Web3Providers>;
}
