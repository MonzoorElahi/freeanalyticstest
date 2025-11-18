"use client";

import { useEffect, useState } from "react";
import { Command, X } from "lucide-react";

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  modifier?: "ctrl" | "shift" | "alt";
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
  enabled?: boolean;
}

export default function KeyboardShortcuts({ shortcuts, enabled = true }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Show help modal with ? key
      if (event.key === "?" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setShowHelp(!showHelp);
        return;
      }

      // Hide help modal with Escape
      if (event.key === "Escape" && showHelp) {
        setShowHelp(false);
        return;
      }

      // Process registered shortcuts
      shortcuts.forEach((shortcut) => {
        const modifierPressed = shortcut.modifier
          ? shortcut.modifier === "ctrl"
            ? event.ctrlKey || event.metaKey
            : shortcut.modifier === "shift"
            ? event.shiftKey
            : event.altKey
          : true;

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (modifierPressed && keyMatches && !showHelp) {
          // Don't trigger if user is typing in an input
          if (
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            event.target instanceof HTMLSelectElement
          ) {
            return;
          }

          event.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts, enabled, showHelp]);

  const formatShortcut = (shortcut: Shortcut) => {
    const parts: string[] = [];
    if (shortcut.modifier === "ctrl") parts.push("Ctrl");
    if (shortcut.modifier === "shift") parts.push("Shift");
    if (shortcut.modifier === "alt") parts.push("Alt");
    parts.push(shortcut.key.toUpperCase());
    return parts.join(" + ");
  };

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="fixed bottom-4 left-4 z-40 p-3 bg-gray-800 dark:bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all hover:scale-110"
        title="Keyboard Shortcuts (Press ?)"
      >
        <Command className="w-5 h-5" />
      </button>

      {/* Help Modal */}
      {showHelp && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
            onClick={() => setShowHelp(false)}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-slideUp">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Command className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {/* Show help shortcut */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show this help</span>
                    <kbd className="px-2 py-1 text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                      ?
                    </kbd>
                  </div>

                  {/* Close help shortcut */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Close this help</span>
                    <kbd className="px-2 py-1 text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                      ESC
                    </kbd>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

                  {/* Registered shortcuts */}
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded whitespace-nowrap">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Press <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">?</kbd> anytime to view shortcuts
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
