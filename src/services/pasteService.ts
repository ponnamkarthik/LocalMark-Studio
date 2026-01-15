interface AttachMarkdownPasteHandlerArgs {
  editor: any;
  monaco: any;
  convertHtmlToMarkdown: (html: string) => string;
}

const stripConsoleArtifacts = (text: string) => {
  return text ? text.replace(/^VM\d+:\d+\s*/gm, "") : "";
};

const looksLikeHtml = (html: string) => /<[a-z][\s\S]*>/i.test(html);

const looksLikeMarkdown = (text: string) => {
  const value = (text || "").trim();
  if (!value) return false;
  if (value.length < 6) return false;
  if (looksLikeHtml(value)) return false;

  // Score-based heuristic. Require multiple signals unless one is very strong.
  const strongSignals: RegExp[] = [
    /(^|\n)```[\s\S]*?```/m, // fenced code
    /^\s{0,3}#{1,6}\s+\S/m, // headings
    /^\s*\[\^[^\]]+\]:\s+\S/m, // footnote def
  ];
  if (strongSignals.some((re) => re.test(value))) return true;

  const signals: RegExp[] = [
    /\[[^\]]+\]\([^)]+\)/, // links
    /!\[[^\]]*\]\([^)]+\)/, // images
    /^\s{0,3}>\s+\S/m, // blockquote
    /^\s{0,3}(-|\*|\+)\s+\S/m, // unordered list
    /^\s{0,3}\d+\.\s+\S/m, // ordered list
    /`[^`]+`/, // inline code
    /(^|\n)\|.+\|\s*$/m, // table-ish rows
    /\*\*[^\n*]+\*\*/, // bold
    /(^|\n)---\s*$/m, // hr
  ];

  let score = 0;
  for (const re of signals) {
    if (re.test(value)) score += 1;
    if (score >= 2) return true;
  }

  return false;
};

export const attachMarkdownPasteHandler = ({
  editor,
  monaco,
  convertHtmlToMarkdown,
}: AttachMarkdownPasteHandlerArgs) => {
  const insertText = (text: string) => {
    const selection = editor.getSelection();
    if (selection) {
      editor.executeEdits("paste-source", [
        { range: selection, text, forceMoveMarkers: true },
      ]);
      editor.focus();
      return;
    }

    const pos = editor.getPosition?.();
    if (pos) {
      const range = new monaco.Range(
        pos.lineNumber,
        pos.column,
        pos.lineNumber,
        pos.column
      );
      editor.executeEdits("paste-source", [
        { range, text, forceMoveMarkers: true },
      ]);
      editor.focus();
    }
  };

  const getPastePayload = async (e: ClipboardEvent) => {
    const htmlFromEvent = e.clipboardData?.getData("text/html") || "";
    const textFromEvent = e.clipboardData?.getData("text/plain") || "";

    // If both are present, return both and decide later.
    if (htmlFromEvent || textFromEvent)
      return { html: htmlFromEvent, text: textFromEvent };

    if (navigator.clipboard && "read" in navigator.clipboard) {
      const clipboardItems = await (navigator.clipboard as any).read();
      for (const item of clipboardItems) {
        let html = "";
        let text = "";
        if (item.types?.includes("text/plain")) {
          const blob = await item.getType("text/plain");
          text = await blob.text();
        }
        if (item.types?.includes("text/html")) {
          const blob = await item.getType("text/html");
          html = await blob.text();
        }
        if (html || text) return { html, text };
      }
    }

    if (navigator.clipboard && "readText" in navigator.clipboard) {
      const text = await navigator.clipboard.readText();
      return { html: "", text };
    }

    return { html: "", text: "" };
  };

  const onPasteCapture = async (e: ClipboardEvent) => {
    if (!editor?.hasTextFocus?.()) return;

    e.preventDefault();
    e.stopPropagation();

    try {
      const { html, text } = await getPastePayload(e);

      // If the clipboard already contains real Markdown in text/plain, prefer it
      // even when HTML is present (many apps include both).
      if (text) {
        const cleanedText = stripConsoleArtifacts(text);
        if (looksLikeMarkdown(cleanedText)) {
          insertText(cleanedText);
          return;
        }
      }

      if (html && looksLikeHtml(html)) {
        const markdown = stripConsoleArtifacts(convertHtmlToMarkdown(html));
        if (markdown.trim()) {
          insertText(markdown);
          return;
        }
      }

      if (text) {
        insertText(stripConsoleArtifacts(text));
      }
    } catch {
      return;
    }
  };

  window.addEventListener("paste", onPasteCapture, true);

  return () => {
    window.removeEventListener("paste", onPasteCapture, true);
  };
};
