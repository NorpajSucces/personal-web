import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/shared/theme-provider";
import { createPublicMetadata, SITE_NAME } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const uiFont = Geist({
  subsets: ["latin"],
  variable: "--font-ui",
});

const readingFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-reading",
});

const publicMetadata = createPublicMetadata({
  description:
    "A personal digital home for what Zhafran builds, learns, and thinks about.",
  path: "/",
});

export const metadata: Metadata = {
  ...publicMetadata,
  metadataBase: getSiteUrl(),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${uiFont.variable} ${readingFont.variable} min-h-dvh bg-background font-sans text-foreground antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
