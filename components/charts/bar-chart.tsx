"use client"

import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface BarChartProps {
  data: { [key: string]: any }[]
  dataKey: string
  categoryKey: string
  chartColors?: string[]
}

export function BarChart({ data, dataKey, categoryKey, chartColors = ["hsl(var(--chart-1))"] }: BarChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
      color: chartColors[0],
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart accessibilityLayer data={data}>
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
          <Bar dataKey={dataKey} fill="var(--color-count)" radius={8} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
