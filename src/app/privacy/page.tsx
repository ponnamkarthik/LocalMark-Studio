import type { Metadata } from "next";
import Link from "next/link";
import {
  LEGAL_LAST_UPDATED,
  PRIVACY_POLICY,
  SITE_NAME,
  SITE_URL,
} from "../../legal/legalContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME}. Local-first storage details and data handling.`,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    type: "article",
    url: `${SITE_URL}/privacy`,
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `Privacy policy for ${SITE_NAME}.`,
  },
};

export default function PrivacyPage() {
  return (
    <main className="h-screen overflow-y-auto bg-theme-bg text-theme-text-main">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {PRIVACY_POLICY.title}
            </h1>
            <p className="mt-2 text-sm text-theme-text-muted">
              Last updated: {LEGAL_LAST_UPDATED}
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-theme-text-muted hover:text-theme-text-main"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-6 text-theme-text-muted">{PRIVACY_POLICY.intro}</p>

        <div className="mt-10 space-y-8">
          {PRIVACY_POLICY.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-theme-border bg-theme-sidebar p-6"
            >
              <h2 className="text-lg font-semibold">{section.title}</h2>
              {section.body?.map((line) => (
                <p key={line} className="mt-3 text-sm text-theme-text-muted">
                  {line}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-theme-text-muted">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-10 text-xs text-theme-text-dim">
          This page is provided for informational purposes and is not legal
          advice.
        </div>
      </div>
    </main>
  );
}
