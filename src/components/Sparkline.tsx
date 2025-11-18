"use client";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  showFill?: boolean;
}

export default function Sparkline({
  data,
  width = 100,
  height = 30,
  color = "#9333ea", // purple-600
  fillColor = "rgba(147, 51, 234, 0.1)",
  strokeWidth = 2,
  showFill = true,
}: SparklineProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Calculate points for the line
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  // Create path for filled area
  const fillPath = showFill
    ? `M 0,${height} L ${points} L ${width},${height} Z`
    : "";

  return (
    <svg
      width={width}
      height={height}
      className="inline-block"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {showFill && (
        <path
          d={fillPath}
          fill={fillColor}
          opacity={0.3}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
