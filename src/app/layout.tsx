import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { appConfig } from "@/config/app";
import { ThemeProvider } from "@/components/theme-provider";
export const metadata: Metadata = {
  title: appConfig.name,
  description: `${appConfig.name} - Personal Blog Platform`,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};
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
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
