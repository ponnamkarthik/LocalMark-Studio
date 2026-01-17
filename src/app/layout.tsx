import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import KofiWidget from "../components/KofiWidget";

const siteTitle = "LocalMark Studio";
const siteTitleWithKeyword = `${siteTitle} — Local-first Markdown Editor`;
const siteDescription =
  "A local-first Markdown editor with file management, intelligent paste, and split-pane preview.";

export const metadata: Metadata = {
  metadataBase: new URL("https://editor.karthikponnam.dev"),
  title: {
    default: siteTitleWithKeyword,
    template: `%s | ${siteTitleWithKeyword}`,
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
    title: siteTitleWithKeyword,
    description: siteDescription,
    url: "/",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitleWithKeyword,
    description: siteDescription,
    images: ["/og-image.webp"],
  },

  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const stored = localStorage.getItem('localmark_theme');
    const theme = stored === 'light' || stored === 'dark' ? stored : 'dark';

    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  } catch {}
})();`,
          }}
        />
        {/* Some SEO checkers only look for /favicon.ico explicitly */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {children}
        <KofiWidget />
      </body>
    </html>
  );
}
