"use client";

import { useState, useEffect } from "react";

export type Theme = "light" | "dark" | "auto";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("auto");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get saved theme from localStorage or default to auto
    const savedTheme = (localStorage.getItem("theme") as Theme) || "auto";
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === "auto") {
      // Use system preference
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  // Listen to system theme changes when in auto mode
  useEffect(() => {
    if (!mounted || theme !== "auto") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("auto");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  return { theme, setTheme, mounted };
}
