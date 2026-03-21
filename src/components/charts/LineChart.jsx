import React from "react";

export default function LineChart({ series, height = 160, color = "#6366f1" }) {
  if (!series || series.length === 0) {
    return (
      <div className="h-[160px] flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl gap-1">
        <span className="text-slate-300 font-semibold">Пока нет данных</span>
      </div>
    );
  }

  const width = 320;
  const padding = 18;
  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step =
    series.length > 1 ? (width - padding * 2) / (series.length - 1) : 0;

  const points = series.map((point, index) => {
    const x = padding + index * step;
    const y =
      padding + (height - padding * 2) * (1 - (point.value - min) / range);
    return { x, y };
  });

  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const lastPoint = points[points.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[160px]">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={pointsString}
        />
        {lastPoint && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="3"
            fill={color}
            stroke="#0f172a"
            strokeWidth="2"
          />
        )}
      </svg>
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>{min.toFixed(0)}</span>
        <span>{max.toFixed(0)}</span>
      </div>
    </div>
  );
}
