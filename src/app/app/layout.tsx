import type { Metadata } from "next";

const siteTitle = "LocalMark Studio";

export const metadata: Metadata = {
  title: "Editor",
  description:
    "Open the LocalMark Studio editor — a local-first Markdown editor with file management, intelligent paste, and split-pane preview.",
  alternates: {
    canonical: "/app",
  },
  openGraph: {
    url: "/app",
    title: `Editor | ${siteTitle}`,
    description:
      "Open the LocalMark Studio editor — a local-first Markdown editor with file management, intelligent paste, and split-pane preview.",
  },
  twitter: {
    title: `Editor | ${siteTitle}`,
    description:
      "Open the LocalMark Studio editor — a local-first Markdown editor with file management, intelligent paste, and split-pane preview.",
  },
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
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
