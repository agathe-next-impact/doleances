'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
// Update the import path if needed; for example, if cookies-banner.tsx is in the same folder:
import CookieBanner from './cookies-banner'
import Analytics from './google-analytics'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}
  <CookieBanner />
  <Analytics />
  </NextThemesProvider>
}
