'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import GoogleAnalytics from './google-analytics'
import MicrosoftClarity from './microsoft-clarity'

const CookieBanner = dynamic(() => import('./cookies-banner'), { ssr: false })

interface AnalyticsProviderProps extends ThemeProviderProps {
  gaId?: string
  clarityId?: string
}

export function ThemeProvider({ children, gaId, clarityId, ...props }: AnalyticsProviderProps) {
  return <NextThemesProvider {...props}>{children}
  <CookieBanner />
  <GoogleAnalytics gaId={gaId} />
  <MicrosoftClarity clarityId={clarityId} />
  </NextThemesProvider>
}
