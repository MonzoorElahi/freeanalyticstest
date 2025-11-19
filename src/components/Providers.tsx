"use client";

import { ReactNode, useEffect } from "react";
import { ToastProvider } from "./Toast";

// Theme initialization script to prevent flash
const ThemeScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const theme = localStorage.getItem('theme') || 'auto';
            const root = document.documentElement;

            if (theme === 'auto') {
              const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (systemDark) {
                root.classList.add('dark');
              } else {
                root.classList.remove('dark');
              }
            } else if (theme === 'dark') {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
          })();
        `,
      }}
    />
  );
};

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize theme on client side
    const theme = localStorage.getItem("theme") || "auto";
    const root = document.documentElement;

    if (theme === "auto") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
