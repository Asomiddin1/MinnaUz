import { Space_Grotesk, Geist_Mono } from "next/font/google"
import "../globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { ActivityTracker } from "@/components/providers/activity-tracker"
import { Metadata } from "next"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/src/i18n/routing"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "MinnaUz - JLPT va Yapon tilini o'rganish platformasi",
    template: "%s | MinnaUz",
  },
  description:
    "MinnaUz orqali yapon tili (JLPT N5-N2) ni interaktiv testlar, lug'atlar va darslar bilan o'rganing.",

  metadataBase: new URL("https://minna.uz"),

  keywords: [
    "JLPT",
    "yapon tili o'rganish",
    "minnauz",
    "kanji",
    "N5 N4 N3 N2",
    "japanese learning Uzbekistan",
  ],

  openGraph: {
    title: "MinnaUz - Til o'rganish platformasi",
    description: "JLPT testlar, lug'at va interaktiv darslar bilan o'rganing",
    url: "https://minna.uz",
    siteName: "MinnaUz",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MinnaUz",
    description: "Yapon tilini o'rganish platformasi",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "scroll-smooth font-sans antialiased",
          spaceGrotesk.variable,
          fontMono.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <AuthProvider>
                <ActivityTracker />
                {children}
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>

        {/* SEO Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "MinnaUz",
              url: "https://minna.uz",
              description: "Yapon tilini o'rganish platformasi",
            }),
          }}
        />
      </body>
    </html>
  )
}
