"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface VolumeDataPoint {
  date: string;
  volume: number;
}

export function VolumeChart({ data, unitLabel = "kg" }: { data: VolumeDataPoint[]; unitLabel?: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-xl border border-fp-border bg-fp-bg-card">
        <p className="text-sm text-fp-text-tertiary">No volume data yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-fp-border bg-fp-bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-fp-text-secondary">Weekly Volume ({unitLabel})</p>
        <span className="rounded-full bg-fp-bg-elevated px-2 py-0.5 text-[11px] text-fp-text-tertiary">
          8 Weeks
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#71717A" }}
            tickFormatter={(d) => {
              const date = new Date(d + "T00:00:00");
              return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "#18181B",
              border: "1px solid #27272A",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(d) => {
              const date = new Date(d + "T00:00:00");
              return date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              });
            }}
            formatter={(value) => [
              `${Number(value).toLocaleString()} ${unitLabel}`,
              "Volume",
            ]}
          />
          <Line
            type="monotone"
            dataKey="volume"
            stroke="#C4F82A"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#C4F82A" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
