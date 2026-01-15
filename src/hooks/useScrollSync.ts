import { useCallback, useEffect, useRef, type MutableRefObject, type RefObject, type UIEvent } from 'react';

interface UseScrollSyncArgs {
  showPreview: boolean;
  previewRef: RefObject<HTMLDivElement | null>;
  editorRef: MutableRefObject<any>;
  monacoRef: MutableRefObject<any>;
}

export function useScrollSync({ showPreview, previewRef, editorRef, monacoRef }: UseScrollSyncArgs) {
  const ignoreEditorScrollEvent = useRef(false);
  const showPreviewRef = useRef(showPreview);

  useEffect(() => {
    showPreviewRef.current = showPreview;
  }, [showPreview]);

  const handleEditorInstanceReady = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      editor.onDidScrollChange((e: any) => {
        if (ignoreEditorScrollEvent.current) return;
        if (previewRef.current && e.scrollTop !== undefined && showPreviewRef.current) {
          const editorScrollHeight = e.scrollHeight;
          const editorViewHeight = editor.getLayoutInfo().height;
          const scrollableHeight = editorScrollHeight - editorViewHeight;
          const percentage = scrollableHeight > 0 ? e.scrollTop / scrollableHeight : 0;
          const preview = previewRef.current;
          const previewScrollableHeight = preview.scrollHeight - preview.clientHeight;
          preview.scrollTop = percentage * previewScrollableHeight;
        }
      });
    },
    [editorRef, monacoRef, previewRef]
  );

  const handlePreviewScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      const preview = e.currentTarget;
      const editor = editorRef.current;
      if (editor && showPreviewRef.current) {
        ignoreEditorScrollEvent.current = true;
        const previewScrollableHeight = preview.scrollHeight - preview.clientHeight;
        const percentage = previewScrollableHeight > 0 ? preview.scrollTop / previewScrollableHeight : 0;
        const editorScrollHeight = editor.getScrollHeight();
        const editorLayoutInfo = editor.getLayoutInfo();
        const editorScrollableHeight = editorScrollHeight - editorLayoutInfo.height;
        editor.setScrollTop(percentage * editorScrollableHeight);
        setTimeout(() => {
          ignoreEditorScrollEvent.current = false;
        }, 10);
      }
    },
    [editorRef]
  );

  return { handleEditorInstanceReady, handlePreviewScroll };
}
