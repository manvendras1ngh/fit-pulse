"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ExerciseProgressPoint {
  date: string;
  estimated1RM: number;
}

export function ExerciseProgressChart({
  data,
}: {
  data: ExerciseProgressPoint[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-fp-border bg-fp-bg-card">
        <p className="text-sm text-fp-text-tertiary">
          No data for this exercise yet
        </p>
      </div>
    );
  }

  const latest = data[data.length - 1];

  return (
    <div className="rounded-xl border border-fp-border bg-fp-bg-card p-4">
      <div className="mb-1">
        <p className="text-xs text-fp-text-tertiary">Estimated 1RM</p>
        <p className="font-space-grotesk text-3xl font-bold text-fp-text-primary">
          {Math.round(latest.estimated1RM)} kg
        </p>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "#18181B",
              border: "1px solid #27272A",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [
              `${Math.round(Number(value))} kg`,
              "Est. 1RM",
            ]}
          />
          <Line
            type="monotone"
            dataKey="estimated1RM"
            stroke="#C4F82A"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
