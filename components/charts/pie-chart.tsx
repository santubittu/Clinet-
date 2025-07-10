"use client"

import { Label, Pie, PieChart as RechartsPieChart, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PieChartProps {
  data: { name: string; value: number }[]
  chartColors?: string[]
}

export function PieChart({
  data,
  chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ],
}: PieChartProps) {
  const totalDocuments = data.reduce((acc, curr) => acc + curr.value, 0)

  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: chartColors[index % chartColors.length],
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
            activeIndex={0}
            activeShape={({ outerRadius = 0, ...props }) => (
              <g>
                <text
                  x={props.cx}
                  y={props.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-2xl"
                >
                  {totalDocuments}
                </text>
                <text
                  x={props.cx}
                  y={props.cy + 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-sm"
                >
                  Total
                </text>
                <Sector {...props} outerRadius={outerRadius + 8} />
              </g>
            )}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

import { Cell, Sector } from "recharts"
