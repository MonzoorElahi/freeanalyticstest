"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Calendar } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  selectedDays: number;
  onDaysChange: (days: number) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  showBreadcrumbs?: boolean;
}

export default function DashboardHeader({
  title,
  subtitle,
  selectedDays,
  onDaysChange,
  onRefresh,
  isLoading,
  showBreadcrumbs = true,
}: DashboardHeaderProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showDatePicker && !(e.target as Element).closest(".date-picker-container")) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDatePicker]);

  const dateOptions = [
    { label: "Last 7 days", value: 7 },
    { label: "Last 14 days", value: 14 },
    { label: "Last 30 days", value: 30 },
    { label: "Last 60 days", value: 60 },
    { label: "Last 90 days", value: 90 },
  ];

  return (
    <div className="mb-8 page-transition">
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="mb-4">
          <Breadcrumbs />
        </div>
      )}

      <div className="divider-gradient" />

      {/* Header Content */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
        <div className="animate-slide-in-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3 animate-slide-in-right">
          <div className="relative date-picker-container">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="btn-secondary flex items-center gap-2 smooth-hover"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                {dateOptions.find((o) => o.value === selectedDays)?.label ||
                  `Last ${selectedDays} days`}
              </span>
            </button>

            {showDatePicker && (
              <>
                {/* Backdrop with blur */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDatePicker(false)}
                />

                {/* Dropdown with glassmorphism */}
                <div className="absolute right-0 mt-2 w-56 glass rounded-xl overflow-hidden z-50 animate-scale-in">
                  {dateOptions.map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onDaysChange(option.value);
                        setShowDatePicker(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm smooth-fast ${
                        selectedDays === option.value
                          ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      } ${index === 0 ? "rounded-t-xl" : ""} ${
                        index === dateOptions.length - 1 ? "rounded-b-xl" : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
