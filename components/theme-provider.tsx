"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Derive props from the actual component to avoid version/type mismatches
export type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export default ThemeProvider
