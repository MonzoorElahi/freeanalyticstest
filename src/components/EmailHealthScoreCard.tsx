"use client";

import { Activity, TrendingUp, TrendingDown, Minus, Shield, Users, Mail, Target } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface EmailHealthScoreCardProps {
  emailHealthScore: {
    score: number;
    listHealthScore: number;
    engagementScore: number;
    deliverabilityScore: number;
    growthScore: number;
    factors: {
      name: string;
      score: number;
      impact: "positive" | "negative" | "neutral";
      description: string;
    }[];
  };
}

export default function EmailHealthScoreCard({ emailHealthScore }: EmailHealthScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-yellow-500 to-amber-500";
    if (score >= 40) return "from-orange-500 to-red-500";
    return "from-red-500 to-rose-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700";
    if (score >= 60) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700";
    if (score >= 40) return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700";
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 40) return "Needs Improvement";
    return "Poor";
  };

  const getImpactIcon = (impact: "positive" | "negative" | "neutral") => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getFactorIcon = (name: string) => {
    switch (name) {
      case "List Health":
        return Users;
      case "Engagement":
        return Activity;
      case "Deliverability":
        return Mail;
      case "List Growth":
        return Target;
      default:
        return Shield;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className={`rounded-xl p-6 border ${getScoreBg(emailHealthScore.score)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Email Marketing Health Score
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overall performance and list health
            </p>
          </div>
          <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>

        <div className="flex items-end gap-4">
          <div>
            <div className={`text-6xl font-bold ${getScoreColor(emailHealthScore.score)}`}>
              {emailHealthScore.score}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
              {getScoreLabel(emailHealthScore.score)}
            </p>
          </div>

          {/* Score visualization */}
          <div className="flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getScoreGradient(emailHealthScore.score)} transition-all duration-1000`}
                style={{ width: `${emailHealthScore.score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">List Health</p>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(emailHealthScore.listHealthScore)}`}>
            {emailHealthScore.listHealthScore}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Engagement</p>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(emailHealthScore.engagementScore)}`}>
            {emailHealthScore.engagementScore}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Deliverability</p>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(emailHealthScore.deliverabilityScore)}`}>
            {emailHealthScore.deliverabilityScore}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-orange-600" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Growth</p>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(emailHealthScore.growthScore)}`}>
            {emailHealthScore.growthScore}
          </p>
        </div>
      </div>

      {/* Health Factors */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Health Factors & Recommendations
        </h4>
        <div className="space-y-3">
          {emailHealthScore.factors.map((factor, idx) => {
            const Icon = getFactorIcon(factor.name);
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
              >
                <div className="mt-0.5">
                  <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {factor.name}
                    </h5>
                    <div className="flex items-center gap-2">
                      {getImpactIcon(factor.impact)}
                      <span className={`text-sm font-bold ${getScoreColor(factor.score)}`}>
                        {factor.score}/100
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {factor.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
