"use client";

import dynamic from "next/dynamic";

const EditorApp = dynamic(() => import("../../editor/EditorApp"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full bg-theme-bg flex items-center justify-center text-theme-text-muted">
      Loading LocalMark...
    </div>
  ),
});

export default function EditorPage() {
  return <EditorApp />;
}
