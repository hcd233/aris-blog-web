import type { Metadata } from "next";
import "./globals.css";
import { appConfig } from "@/config/app";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import Link from "next/link";

export const metadata: Metadata = {
  title: appConfig.name,
  description: `${appConfig.name} - Personal Blog Platform`,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {appConfig.iconUrl && (
          <>
            <link rel="icon" href={appConfig.iconUrl} />
            <link rel="shortcut icon" href={appConfig.iconUrl} />

            <link rel="apple-touch-icon" href={appConfig.iconUrl} />
          </>
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen">
            <header className="border-b">
              <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="font-semibold">Home</Link>
                <nav className="flex items-center gap-4 text-sm text-gray-600">
                  <Link href="/articles">Articles</Link>
                </nav>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
