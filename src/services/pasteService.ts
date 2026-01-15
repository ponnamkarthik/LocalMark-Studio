interface AttachMarkdownPasteHandlerArgs {
  editor: any;
  monaco: any;
  convertHtmlToMarkdown: (html: string) => string;
}

const stripConsoleArtifacts = (text: string) => {
  return text ? text.replace(/^VM\d+:\d+\s*/gm, '') : '';
};

const looksLikeHtml = (html: string) => /<[a-z][\s\S]*>/i.test(html);

export const attachMarkdownPasteHandler = ({ editor, monaco, convertHtmlToMarkdown }: AttachMarkdownPasteHandlerArgs) => {
  const insertText = (text: string) => {
    const selection = editor.getSelection();
    if (selection) {
      editor.executeEdits('paste-source', [{ range: selection, text, forceMoveMarkers: true }]);
      editor.focus();
      return;
    }

    const pos = editor.getPosition?.();
    if (pos) {
      const range = new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);
      editor.executeEdits('paste-source', [{ range, text, forceMoveMarkers: true }]);
      editor.focus();
    }
  };

  const getPastePayload = async (e: ClipboardEvent) => {
    const htmlFromEvent = e.clipboardData?.getData('text/html') || '';
    const textFromEvent = e.clipboardData?.getData('text/plain') || '';

    if (htmlFromEvent) return { html: htmlFromEvent, text: textFromEvent };
    if (textFromEvent) return { html: '', text: textFromEvent };

    if (navigator.clipboard && 'read' in navigator.clipboard) {
      const clipboardItems = await (navigator.clipboard as any).read();
      for (const item of clipboardItems) {
        if (item.types?.includes('text/html')) {
          const blob = await item.getType('text/html');
          const html = await blob.text();
          return { html, text: '' };
        }
        if (item.types?.includes('text/plain')) {
          const blob = await item.getType('text/plain');
          const text = await blob.text();
          return { html: '', text };
        }
      }
    }

    if (navigator.clipboard && 'readText' in navigator.clipboard) {
      const text = await navigator.clipboard.readText();
      return { html: '', text };
    }

    return { html: '', text: '' };
  };

  const onPasteCapture = async (e: ClipboardEvent) => {
    if (!editor?.hasTextFocus?.()) return;

    e.preventDefault();
    e.stopPropagation();

    try {
      const { html, text } = await getPastePayload(e);

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

  window.addEventListener('paste', onPasteCapture, true);

  return () => {
    window.removeEventListener('paste', onPasteCapture, true);
  };
};

