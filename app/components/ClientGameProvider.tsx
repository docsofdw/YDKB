'use client';

import { GameProvider } from "@/app/hooks/useGameContext";
import { ReactNode } from "react";

export default function ClientGameProvider({ children }: { children: ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
} 