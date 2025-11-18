"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface TooltipProps {
  content: string | React.ReactNode;
  children?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  showIcon?: boolean;
}

export default function Tooltip({
  content,
  children,
  position = "top",
  showIcon = true,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();

      // Check if tooltip would overflow viewport
      let newPosition = position;

      if (position === "top" && tooltipRect.top < 0) {
        newPosition = "bottom";
      } else if (position === "bottom" && tooltipRect.bottom > window.innerHeight) {
        newPosition = "top";
      } else if (position === "left" && tooltipRect.left < 0) {
        newPosition = "right";
      } else if (position === "right" && tooltipRect.right > window.innerWidth) {
        newPosition = "left";
      }

      setAdjustedPosition(newPosition);
    }
  }, [isVisible, position]);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700",
    left: "left-full top-1/2 transform -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700",
    right: "right-full top-1/2 transform -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700",
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Trigger */}
      {children || (
        showIcon && (
          <button
            type="button"
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="More information"
          >
            <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )
      )}

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[adjustedPosition]} animate-fadeIn`}
          role="tooltip"
        >
          <div className="relative px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg max-w-xs">
            {content}
            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[adjustedPosition]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
