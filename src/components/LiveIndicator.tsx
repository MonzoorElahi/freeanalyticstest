"use client";

import { useState, useEffect } from "react";
import { Activity, Wifi, WifiOff } from "lucide-react";

interface LiveIndicatorProps {
  lastUpdated?: Date;
  isRefreshing?: boolean;
}

export default function LiveIndicator({ lastUpdated, isRefreshing }: LiveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateTime = () => {
      if (!lastUpdated) {
        setTimeAgo("Never");
        return;
      }

      const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);

      if (seconds < 60) {
        setTimeAgo("Just now");
      } else if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        setTimeAgo(`${mins}m ago`);
      } else {
        const hours = Math.floor(seconds / 3600);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5">
        {isRefreshing ? (
          <Activity className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
        ) : lastUpdated ? (
          <Wifi className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-gray-400" />
        )}
        <span className="text-gray-500 dark:text-gray-400">
          {isRefreshing ? "Syncing..." : `Updated ${timeAgo}`}
        </span>
      </div>
      {lastUpdated && !isRefreshing && (
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
      )}
    </div>
  );
}
