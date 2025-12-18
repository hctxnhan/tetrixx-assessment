import { memo, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartDataPoint } from "@/types";
import { config } from "@/config";
import { Card } from "./ui/card";
import { Loader2 } from "lucide-react";

interface RealTimeChartProps {
  data: ChartDataPoint[];
  threshold: number;
  isPaused?: boolean;
  isConnected?: boolean;
}

export const RealTimeChart = memo<RealTimeChartProps>(
  ({ data, threshold }) => {
    const chartData = useMemo(
      () =>
        data.map((point) => ({
          ...point,
          unixTime: new Date(point.timestamp).getTime(),
        })),
      [data]
    );

    const isThresholdBreached =
      data.length > 0 && data[data.length - 1].price > threshold;

    const xDomain = useMemo(() => {
      if (chartData.length === 0) return ["auto", "auto"];
      const lastTime = chartData[chartData.length - 1].unixTime;
      const windowSize = config.chartDataBufferSize * 1000;
      return [lastTime - windowSize, lastTime];
    }, [chartData]);

    const chartColor = isThresholdBreached ? "#f43f5e" : "#6366f1"; // Rose-500 or Indigo-500
    const gradientId = "colorPrice";

    if (data.length === 0) {
      return (
        <Card className="w-full h-full flex flex-col items-center justify-center min-h-[400px] bg-slate-50 border-dashed">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-2" />
          <p className="text-slate-500 text-sm font-medium">Waiting for data stream...</p>
        </Card>
      );
    }

    return (
      <div className="w-full h-full min-h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />

            <XAxis
              dataKey="unixTime"
              type="number"
              domain={xDomain}
              allowDataOverflow={true}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={40}
              tickFormatter={(time) =>
                new Date(time).toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              }
            />

            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, (dataMax: number) => Math.max(dataMax, threshold) * 1.1]}
              tickFormatter={(value) => `$${value}`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length && label) {
                  return (
                    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">
                        {new Date(label).toLocaleTimeString()}
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        ${Number(payload[0].value).toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine
              y={threshold}
              stroke="#f97316"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                position: "insideTopRight",
                value: `Alert Limit: $${threshold}`,
                fill: "#f97316",
                fontSize: 11,
                fontWeight: 500
              }}
            />

            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              animationDuration={300}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

RealTimeChart.displayName = "RealTimeChart";