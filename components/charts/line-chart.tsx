"use client"

import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface LineChartProps {
  data: { [key: string]: any }[]
  dataKey: string
  categoryKey: string
  secondaryDataKey?: string
  chartColors?: string[]
}

export function LineChart({
  data,
  dataKey,
  categoryKey,
  secondaryDataKey,
  chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"],
}: LineChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
      color: chartColors[0],
    },
    ...(secondaryDataKey && {
      [secondaryDataKey]: {
        label: secondaryDataKey.charAt(0).toUpperCase() + secondaryDataKey.slice(1),
        color: chartColors[1],
      },
    }),
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={categoryKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Line dataKey={dataKey} type="monotone" stroke="var(--color-count)" strokeWidth={2} dot={false} />
          {secondaryDataKey && (
            <Line
              dataKey={secondaryDataKey}
              type="monotone"
              stroke="var(--color-downloaded)"
              strokeWidth={2}
              dot={false}
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
