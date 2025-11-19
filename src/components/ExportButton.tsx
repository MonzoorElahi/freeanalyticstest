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
        className="btn-secondary flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">Export</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 glass rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in">
            <div className="p-3">
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-sm font-bold text-gradient uppercase tracking-wide">
                  Export to CSV
                </p>
              </div>

              <div className="divider-gradient my-2" />

              {exportOptions.map((option, index) => (
                <button
                  key={option.type}
                  onClick={() => exportData(option.type)}
                  disabled={loading !== null}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg smooth-fast disabled:opacity-50 interactive-card"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`p-2 rounded-lg ${loading === option.type ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-gray-100 dark:bg-gray-700'} smooth-hover`}>
                    <option.icon className={`w-4 h-4 ${loading === option.type ? 'text-purple-600 dark:text-purple-400 animate-pulse' : 'text-gray-600 dark:text-gray-400'}`} />
                  </div>
                  <span className="font-medium">
                    {loading === option.type ? "Exporting..." : option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
