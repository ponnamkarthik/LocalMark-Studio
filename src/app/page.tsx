import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Command,
  Database,
  Download,
  FolderTree,
  Network,
  PenLine,
  Search,
  Shield,
  Sigma,
  SplitSquareVertical,
  Tags,
  Wand2,
} from "lucide-react";

const siteTitle = "LocalMark Studio";
const siteDescription =
  "A local-first Markdown editor with file management, intelligent paste, and split-pane preview.";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    title: siteTitle,
    description: siteDescription,
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "LocalMark Studio",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    description:
      "A local-first Markdown editor with file management, intelligent paste, and split-pane preview.",
    url: "https://editor.karthikponnam.dev/",
  };

  return (
    // Body is overflow-hidden for the editor app; make this page scrollable.
    <main className="h-screen overflow-y-auto bg-theme-bg text-theme-text-main">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pointer-events-none fixed inset-x-0 top-0 h-105 bg-linear-to-b from-emerald-500/10 via-emerald-500/5 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-linear-to-tr from-emerald-500 to-green-400 rounded-lg blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-linear-to-br from-emerald-500 to-green-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20 ring-1 ring-white/10">
                <PenLine
                  size={16}
                  className="text-white relative z-10 transform group-hover:-rotate-12 transition-transform duration-300"
                  strokeWidth={2.5}
                />
              </div>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">LocalMark</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-theme-text-muted">
                Studio
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-theme-text-muted md:flex">
            <a href="#features" className="hover:text-theme-text-main">
              Features
            </a>
            <a href="#workflow" className="hover:text-theme-text-main">
              Workflow
            </a>
            <a href="#export" className="hover:text-theme-text-main">
              Export
            </a>
            <a href="#faq" className="hover:text-theme-text-main">
              FAQ
            </a>
          </div>

          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-md bg-theme-accent px-4 py-2 text-sm font-semibold text-black hover:bg-theme-accent-hover"
          >
            Open Editor <ArrowRight size={16} />
          </Link>
        </nav>

        <header className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-activity px-3 py-1 text-xs font-semibold text-theme-text-muted">
              <Shield size={14} className="text-emerald-400" />
              Local-first • Runs in your browser • No signup
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              A fast, local-first Markdown editor for real work.
            </h1>

            <p className="mt-4 text-lg text-theme-text-muted">
              LocalMark Studio helps you write and organize Markdown with a real
              file tree, a command palette, smart paste from the web, and a
              split-pane preview with scroll sync.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/editor"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-theme-accent px-5 py-2.5 text-sm font-semibold text-black hover:bg-theme-accent-hover"
              >
                Launch the editor <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-md border border-theme-border bg-theme-hover px-5 py-2.5 text-sm font-semibold text-theme-text-main"
              >
                Explore features
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-theme-text-dim">
              <span className="rounded-full border border-theme-border bg-theme-bg px-3 py-1">
                IndexedDB storage
              </span>
              <span className="rounded-full border border-theme-border bg-theme-bg px-3 py-1">
                Import HTML → Markdown
              </span>
              <span className="rounded-full border border-theme-border bg-theme-bg px-3 py-1">
                Export: MD / HTML / PDF / JSON
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-theme-border bg-theme-sidebar p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">What you get</div>
              <div className="text-xs text-theme-text-dim">Built for speed</div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-theme-border bg-theme-bg p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FolderTree size={16} className="text-emerald-400" /> File
                  tree
                </div>
                <p className="mt-1 text-sm text-theme-text-muted">
                  Folders, files, rename, delete — organized like a real
                  project.
                </p>
              </div>
              <div className="rounded-xl border border-theme-border bg-theme-bg p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Command size={16} className="text-emerald-400" /> Command
                  palette
                </div>
                <p className="mt-1 text-sm text-theme-text-muted">
                  Quick actions with ⌘⇧P / Ctrl⇧P (plus F1).
                </p>
              </div>
              <div className="rounded-xl border border-theme-border bg-theme-bg p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <SplitSquareVertical size={16} className="text-emerald-400" />{" "}
                  Split preview
                </div>
                <p className="mt-1 text-sm text-theme-text-muted">
                  Live preview with themes and scroll sync.
                </p>
              </div>
              <div className="rounded-xl border border-theme-border bg-theme-bg p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Wand2 size={16} className="text-emerald-400" /> Smart paste
                </div>
                <p className="mt-1 text-sm text-theme-text-muted">
                  Paste HTML and get clean Markdown automatically.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section id="features" className="mt-20">
          <div>
            <h2 className="text-2xl font-semibold">
              Features that stay out of your way
            </h2>
            <p className="mt-2 text-theme-text-muted">
              Everything is stored locally in your browser (IndexedDB) — great
              for drafts, notes, and private writing.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-theme-border bg-theme-sidebar p-5">
              <div className="flex items-center gap-2 font-semibold">
                <Database size={18} className="text-emerald-400" /> Local-first
                storage
              </div>
              <p className="mt-2 text-sm text-theme-text-muted">
                Files live in your browser. No accounts required.
              </p>
            </div>
            <div className="rounded-2xl border border-theme-border bg-theme-sidebar p-5">
              <div className="flex items-center gap-2 font-semibold">
                <Search size={18} className="text-emerald-400" /> Search +
                replace
              </div>
              <p className="mt-2 text-sm text-theme-text-muted">
                Find matches across files and replace safely.
              </p>
            </div>
            <div className="rounded-2xl border border-theme-border bg-theme-sidebar p-5">
              <div className="flex items-center gap-2 font-semibold">
                <Tags size={18} className="text-emerald-400" /> Tags + metadata
              </div>
              <p className="mt-2 text-sm text-theme-text-muted">
                Add tags and custom key-value metadata per file.
              </p>
            </div>
            <div className="rounded-2xl border border-theme-border bg-theme-sidebar p-5">
              <div className="flex items-center gap-2 font-semibold">
                <Network size={18} className="text-emerald-400" /> Mermaid
                diagrams
              </div>
              <p className="mt-2 text-sm text-theme-text-muted">
                Toggle Mermaid support to render flowcharts and diagrams.
              </p>
            </div>
            <div className="rounded-2xl border border-theme-border bg-theme-sidebar p-5">
              <div className="flex items-center gap-2 font-semibold">
                <Sigma size={18} className="text-emerald-400" /> Math (KaTeX)
              </div>
              <p className="mt-2 text-sm text-theme-text-muted">
                Toggle math support for LaTeX equations rendered with KaTeX.
              </p>
            </div>
            <div className="rounded-2xl border border-theme-border bg-theme-sidebar p-5">
              <div className="flex items-center gap-2 font-semibold">
                <Download size={18} className="text-emerald-400" /> Import +
                export
              </div>
              <p className="mt-2 text-sm text-theme-text-muted">
                Import Markdown/text (or HTML → Markdown). Export as MD, HTML,
                PDF, or JSON metadata.
              </p>
            </div>
          </div>
        </section>

        <section id="workflow" className="mt-20">
          <h2 className="text-2xl font-semibold">A simple workflow</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-theme-border bg-theme-sidebar p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-theme-text-dim">
                Step 1
              </div>
              <div className="mt-2 text-lg font-semibold">
                Create files and folders
              </div>
              <p className="mt-2 text-sm text-theme-text-muted">
                Organize notes like a project: nested folders, rename, delete,
                and quick navigation.
              </p>
            </div>
            <div className="rounded-2xl border border-theme-border bg-theme-sidebar p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-theme-text-dim">
                Step 2
              </div>
              <div className="mt-2 text-lg font-semibold">Write with speed</div>
              <p className="mt-2 text-sm text-theme-text-muted">
                Use the command palette to toggle preview, themes, and Markdown
                features.
              </p>
            </div>
            <div className="rounded-2xl border border-theme-border bg-theme-sidebar p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-theme-text-dim">
                Step 3
              </div>
              <div className="mt-2 text-lg font-semibold">
                Export when you’re ready
              </div>
              <p className="mt-2 text-sm text-theme-text-muted">
                Download a Markdown file, a styled HTML page, a PDF, or JSON
                metadata.
              </p>
            </div>
          </div>
        </section>

        <section id="export" className="mt-20">
          <div className="rounded-2xl border border-theme-border bg-theme-activity p-6">
            <h2 className="text-2xl font-semibold">Export formats</h2>
            <p className="mt-2 text-theme-text-muted">
              LocalMark Studio supports exporting the active document as:
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Markdown", desc: "Raw .md source" },
                { title: "Styled HTML", desc: "Standalone web page" },
                { title: "PDF", desc: "Print-ready output" },
                { title: "JSON metadata", desc: "Full file attributes" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-theme-border bg-theme-bg p-4"
                >
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-1 text-sm text-theme-text-muted">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-theme-text-muted">
                Tip: Import HTML files and convert them to Markdown
                automatically.
              </div>
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 rounded-md bg-theme-accent px-4 py-2 text-sm font-semibold text-black hover:bg-theme-accent-hover"
              >
                Try it now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section id="faq" className="mt-20">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="mt-6 grid gap-3">
            <details className="rounded-xl border border-theme-border bg-theme-sidebar p-5">
              <summary className="cursor-pointer text-sm font-semibold">
                Where are my files stored?
              </summary>
              <p className="mt-2 text-sm text-theme-text-muted">
                Locally in your browser using IndexedDB. This keeps your notes
                fast and private.
              </p>
            </details>
            <details className="rounded-xl border border-theme-border bg-theme-sidebar p-5">
              <summary className="cursor-pointer text-sm font-semibold">
                Does it work offline?
              </summary>
              <p className="mt-2 text-sm text-theme-text-muted">
                Your documents are stored locally, so they remain available even
                without an internet connection.
              </p>
            </details>
            <details className="rounded-xl border border-theme-border bg-theme-sidebar p-5">
              <summary className="cursor-pointer text-sm font-semibold">
                Can I export my work?
              </summary>
              <p className="mt-2 text-sm text-theme-text-muted">
                Yes — export Markdown, HTML, PDF, or JSON metadata from the
                editor.
              </p>
            </details>
          </div>
        </section>

        <footer className="mt-20 border-t border-theme-border py-10 text-sm text-theme-text-dim">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} LocalMark Studio</div>
            <div className="flex items-center gap-4">
              <a href="#features" className="hover:text-theme-text-main">
                Features
              </a>
              <a href="#faq" className="hover:text-theme-text-main">
                FAQ
              </a>
              <Link href="/editor" className="hover:text-theme-text-main">
                Open Editor
              </Link>
              <Link href="/privacy" className="hover:text-theme-text-main">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-theme-text-main">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
