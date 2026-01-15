import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import KofiWidget from "../components/KofiWidget";

const siteTitle = "LocalMark Studio";
const siteDescription =
  "A local-first Markdown editor with file management, intelligent paste, and split-pane preview.";

export const metadata: Metadata = {
  metadataBase: new URL("https://editor.karthikponnam.dev"),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  keywords: [
    "markdown editor",
    "local-first",
    "offline",
    "split pane preview",
    "monaco editor",
    "notes",
  ],
  applicationName: siteTitle,
  creator: siteTitle,
  publisher: siteTitle,
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: siteTitle,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.svg"],
  },

  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon.svg",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1115",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {children}
        <KofiWidget />
      </body>
    </html>
  );
}
