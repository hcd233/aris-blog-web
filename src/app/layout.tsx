import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { appConfig } from "@/config/app";
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
    <html lang="en">
      <head>
        {appConfig.iconUrl && (
          <>
            <link rel="icon" href={appConfig.iconUrl} />
            <link rel="shortcut icon" href={appConfig.iconUrl} />

            <link rel="apple-touch-icon" href={appConfig.iconUrl} />
          </>
        )}
      </head>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
