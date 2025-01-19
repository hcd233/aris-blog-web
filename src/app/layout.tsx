import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Providers } from "@/components/providers"
import "@/styles/glass.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Aris Blog",
  description: "深度学习",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Header />
            <main className="container mx-auto px-4 py-6">
              {children}
            </main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
} 