"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Users, Package, BarChart } from "lucide-react";

interface ExportButtonProps {
  days: number;
  startDate?: string;
  endDate?: string;
}

export default function ExportButton({ days, startDate, endDate }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const exportData = async (type: string) => {
    setLoading(type);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, days, startDate, endDate }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ||
        `export_${type}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setLoading(null);
      setIsOpen(false);
    }
  };

  const exportOptions = [
    { type: "sales_summary", label: "Sales Summary", icon: BarChart },
    { type: "orders", label: "All Orders", icon: FileSpreadsheet },
    { type: "customers", label: "All Customers", icon: Users },
    { type: "products", label: "All Products", icon: Package },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-export-button
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 font-medium">
                Export to CSV
              </p>
              {exportOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => exportData(option.type)}
                  disabled={loading !== null}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                >
                  <option.icon className="w-4 h-4 text-gray-500" />
                  {loading === option.type ? "Exporting..." : option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
