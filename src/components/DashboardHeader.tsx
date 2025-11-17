"use client";

import { useState } from "react";
import { RefreshCw, Calendar } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  selectedDays: number;
  onDaysChange: (days: number) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function DashboardHeader({
  title,
  subtitle,
  selectedDays,
  onDaysChange,
  onRefresh,
  isLoading,
}: DashboardHeaderProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateOptions = [
    { label: "Last 7 days", value: 7 },
    { label: "Last 14 days", value: 14 },
    { label: "Last 30 days", value: 30 },
    { label: "Last 60 days", value: 60 },
    { label: "Last 90 days", value: 90 },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {dateOptions.find((o) => o.value === selectedDays)?.label ||
                `Last ${selectedDays} days`}
            </span>
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onDaysChange(option.value);
                    setShowDatePicker(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                    selectedDays === option.value
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
          />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>
    </div>
  );
}
