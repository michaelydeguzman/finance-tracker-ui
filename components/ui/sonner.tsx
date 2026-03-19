"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const isToasterTheme = (value: unknown): value is NonNullable<ToasterProps["theme"]> =>
  value === "light" || value === "dark" || value === "system"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme: resolvedTheme } = useTheme()
  const theme = isToasterTheme(resolvedTheme) ? resolvedTheme : undefined
  const themeProps: Pick<ToasterProps, "theme"> = theme === undefined ? {} : { theme }

  return (
    <Sonner
      {...themeProps}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
