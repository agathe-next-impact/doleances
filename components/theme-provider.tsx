'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import Analytics from './google-analytics'

const CookieBanner = dynamic(() => import('./cookies-banner'), { ssr: false })

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}
  <CookieBanner />
  <Analytics />
  </NextThemesProvider>
}
