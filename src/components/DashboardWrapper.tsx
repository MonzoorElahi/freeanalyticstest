"use client";

import { ReactNode, useState } from "react";
import ErrorBoundary from "./ErrorBoundary";
import CommandPalette from "./CommandPalette";
import { useCommandPalette } from "@/hooks/useKeyboardShortcuts";

interface DashboardWrapperProps {
  children: ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Enable Cmd/Ctrl + K to open command palette
  useCommandPalette(() => setShowCommandPalette(true));

  return (
    <ErrorBoundary>
      {children}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
    </ErrorBoundary>
  );
}
