"use client"

import * as React from "react"

export type ToastActionElement = React.ReactElement

export type ToastProps = React.ComponentPropsWithoutRef<"div"> & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

