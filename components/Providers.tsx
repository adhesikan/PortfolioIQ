"use client";

import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <PortfolioProvider>{children}</PortfolioProvider>;
}
