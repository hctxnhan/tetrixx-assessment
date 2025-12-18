import * as React from "react"
import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    aspectRatio?: "square" | "video" | number
  }
>(({ className, aspectRatio = "video", ...props }, ref) => {
  const ratioClass = {
    square: "aspect-square",
    video: "aspect-video",
  }[aspectRatio] as string

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full",
        typeof aspectRatio === "number" && undefined,
        typeof aspectRatio !== "number" && ratioClass,
        className
      )}
      style={
        typeof aspectRatio === "number"
          ? { aspectRatio: aspectRatio }
          : undefined
      }
      {...props}
    />
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    content?: React.ReactNode
  }
>(({ className, content, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "border bg-background px-3 py-1.5 text-sm shadow-md",
        "rounded-lg",
        "z-50",
        className
      )}
      {...props}
    >
      {content}
    </div>
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: any[]
    label?: string
    labelKey?: string
    nameKey?: string
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
  }
>(
  (
    {
      active,
      payload,
      label,
      className,
      labelKey,
      nameKey,
      hideLabel = false,
      hideIndicator = false,
      indicator = "dot",
      ...props
    },
    ref
  ) => {
    if (!active || !payload?.length) {
      return null
    }

    const tooltipLabel = hideLabel ? null : (
      <div className="font-medium text-xs text-muted-foreground">
        {label}
      </div>
    )

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "border bg-background px-3 py-1.5 text-sm shadow-md",
          "rounded-lg",
          "z-50",
          "space-y-1",
          className
        )}
        {...props}
      >
        {!nestLabel ? tooltipLabel : null}
        {payload.map((item, index) => {
          const indicatorColor = item.fill

          return (
            <div
              key={index}
              className={cn(
                "flex w-full flex-wrap items-center gap-2",
                "[&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              )}
            >
              <>
                {!hideIndicator && (
                  <div
                    className={cn(
                      "shrink-0 rounded-[2px] border-[2px] border-background",
                      indicator === "dot" && "h-2.5 w-2.5 rounded-full",
                      indicator === "line" && "h-0.5 w-2.5",
                      indicator === "dashed" && "h-0.5 w-2.5 border-dashed"
                    )}
                    style={{
                      backgroundColor: indicatorColor,
                    }}
                  />
                )}
                <div className="flex flex-1 gap-2">
                  {nestLabel ? tooltipLabel : null}
                  <span className="font-medium text-xs text-foreground">
                    {nameKey ? item.payload[nameKey] : item.name}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {item.value.toLocaleString()}
                </span>
              </>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    content?: React.ReactNode
  }
>(({ className, content, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        "text-xs",
        className
      )}
      {...props}
    >
      {content}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: any[]
    nameKey?: string
    vertical?: boolean
  }
>(
  (
    { payload, className, nameKey, vertical = false, ...props },
    ref
  ) => {
    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          "text-xs",
          vertical ? "flex-col" : "flex-row",
          className
        )}
        {...props}
      >
        {payload.map((entry, index) => (
          <div
            key={`item-${index}`}
            className="flex items-center gap-2"
          >
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: entry.color,
              }}
            />
            <span className="text-muted-foreground">
              {nameKey ? entry.payload[nameKey] : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

// Chart config type
export type ChartConfig = {
  [k: string]: {
    label?: string
    icon?: React.ComponentType<any>
    color?: string
    theme?: {
      light: string
      dark: string
    }
  }
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}