"use client";

import { Doughnut, Bar } from "react-chartjs-2";
import type { MailChimpSubjectLineAnalysis } from "@/types";

interface SubjectLineAnalysisChartProps {
  data: MailChimpSubjectLineAnalysis;
}

export default function SubjectLineAnalysisChart({ data }: SubjectLineAnalysisChartProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No subject line data available
      </div>
    );
  }

  // Emoji usage data
  const emojiData = {
    labels: ["With Emoji", "Without Emoji"],
    datasets: [
      {
        data: [data.emojiUsage.used, data.emojiUsage.notUsed],
        backgroundColor: [
          "rgba(251, 146, 60, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderColor: [
          "rgba(251, 146, 60, 1)",
          "rgba(156, 163, 175, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Personalization usage data
  const personalizationData = {
    labels: ["Personalized", "Generic"],
    datasets: [
      {
        data: [data.personalizationUsage.used, data.personalizationUsage.notUsed],
        backgroundColor: [
          "rgba(139, 92, 246, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderColor: [
          "rgba(139, 92, 246, 1)",
          "rgba(156, 163, 175, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Avg Subject Length</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {data.avgLength} chars
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300 mb-1">Avg Open Rate</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {(data.avgOpenRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Optimal Length */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
          🎯 Optimal Subject Line Length
        </p>
        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
          {data.topPerformingLength.min}-{data.topPerformingLength.max} characters
        </p>
        <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
          {(data.topPerformingLength.avgOpenRate * 100).toFixed(1)}% average open rate
        </p>
      </div>

      {/* Emoji and Personalization Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Emoji Usage
          </h4>
          <div className="h-48">
            <Doughnut data={emojiData} options={doughnutOptions} />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Personalization
          </h4>
          <div className="h-48">
            <Doughnut data={personalizationData} options={doughnutOptions} />
          </div>
        </div>
      </div>

    </div>
  );
}
