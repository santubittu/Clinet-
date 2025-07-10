"use client"

import * as React from "react"
import { Label, ResponsiveContainer, Tooltip, TooltipProps } from "recharts"
import {
  ContentProps,
  NameType,
  ValueType,
} from "recharts/types/component/Tooltip"

import { cn } from "@/lib/utils"

const ChartContext = React.createContext<
  React.ComponentProps<typeof ChartContainer>
>(null)

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof ChartContainer>) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId}`
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-foreground",
          className
        )}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}
ChartContainer.displayName = "Chart"

const ChartTooltip = ({ ...props }: TooltipProps<ValueType, NameType>) => {
  const { config } = React.useContext(ChartContext)
  const id = React.useId()

  return (
    <Tooltip
      // @ts-ignore
      wrapperId={`tooltip-${id}`}
      content={({ payload, label }) => (
        <ChartTooltipContent payload={payload} label={label} config={config} />
      )}
      {...props}
    />
  )
}
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ContentProps<ValueType, NameType> & {
    nameKey?: string
  }
>(({ className, payload, nameKey, label, config, ...props }, ref) => {
  const { config: contextConfig } = React.useContext(ChartContext)
  const relevantConfig = config || contextConfig

  const entries = React.useMemo(() => {
    if (!payload || !payload.length) return []
    return payload.map((entry) => ({
      ...entry,
      color: entry.color || relevantConfig?.[entry.dataKey as string]?.color,
    }))
  }, [payload, relevantConfig])

  if (!payload?.length) return null

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-2 text-sm shadow-md dark:border-gray-800 dark:bg-gray-950",
        className
      )}
      {...props}
    >
      {label && (
        <div className="border-b border-gray-200 pb-2 text-gray-900 dark:border-gray-800 dark:text-gray-50">
          {label}
        </div>
      )}
      {entries.map((entry, index) => (
        <div key={entry.dataKey || index} className="flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-1">
            {entry.color && (
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: entry.color,
                }}
              />
            )}
            <span className="text-gray-500 dark:text-gray-400">
              {relevantConfig?.[entry.dataKey as string]?.label || entry.nameKey || entry.name || String(entry.dataKey)}
            </span>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-50">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = ({ ...props }: React.ComponentProps<typeof Label>) => {
  return <Label {...props} />
}
ChartLegend.displayName = "ChartLegend"

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend }
