"use client";

import { Award, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import type { MailChimpCampaignScore } from "@/types";

interface CampaignScoresTableProps {
  scores: MailChimpCampaignScore[];
}

export default function CampaignScoresTable({ scores }: CampaignScoresTableProps) {
  if (!scores || scores.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        No campaign scores available
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
    if (score >= 40) return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 40) return "D";
    return "F";
  };

  return (
    <div className="space-y-4">
      {scores.map((campaign, idx) => (
        <div
          key={campaign.campaignId}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  idx === 0
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : idx === 1
                    ? "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                    : idx === 2
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                }`}
              >
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {campaign.campaignTitle}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Campaign Performance Analysis
                </p>
              </div>
            </div>

            {/* Overall Score Badge */}
            <div className={`px-3 py-1.5 rounded-lg font-bold text-lg ${getScoreBg(campaign.overallScore)}`}>
              {getScoreGrade(campaign.overallScore)}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overall</p>
              <p className={`text-lg font-bold ${getScoreColor(campaign.overallScore)}`}>
                {campaign.overallScore}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Open Rate</p>
              <p className={`text-lg font-bold ${getScoreColor(campaign.openRateScore)}`}>
                {campaign.openRateScore}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Click Rate</p>
              <p className={`text-lg font-bold ${getScoreColor(campaign.clickRateScore)}`}>
                {campaign.clickRateScore}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Conversion</p>
              <p className={`text-lg font-bold ${getScoreColor(campaign.conversionScore)}`}>
                {campaign.conversionScore}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Delivery</p>
              <p className={`text-lg font-bold ${getScoreColor(campaign.deliverabilityScore)}`}>
                {campaign.deliverabilityScore}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          {campaign.recommendations && campaign.recommendations.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h5 className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                  Recommendations for Improvement
                </h5>
              </div>
              <ul className="space-y-1.5">
                {campaign.recommendations.map((rec, recIdx) => (
                  <li
                    key={recIdx}
                    className="flex items-start gap-2 text-xs text-blue-800 dark:text-blue-200"
                  >
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
