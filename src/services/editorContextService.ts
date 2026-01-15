import * as tableService from './tableService';

type EditorLike = {
  getModel: () => any;
  getPosition?: () => any;
  onDidChangeCursorPosition: (cb: (e: any) => void) => { dispose: () => void };
};

const computeActiveFormats = (model: any, position: any): Set<string> => {
  const lineContent = model.getLineContent(position.lineNumber);
  const formats = new Set<string>();

  if (/^#{1,6}\s/.test(lineContent)) formats.add('heading');
  if (/^>\s/.test(lineContent)) formats.add('quote');
  if (/^\s*[-*+]\s/.test(lineContent)) formats.add('list-ul');
  if (/^\s*\d+\.\s/.test(lineContent)) formats.add('list-ol');
  if (/^\s*[-*+]\s\[[ xX]?\]/.test(lineContent)) formats.add('checklist');
  if (lineContent.trim().startsWith('```')) formats.add('code-block');

  const beforeCursor = lineContent.substring(0, position.column - 1);
  const afterCursor = lineContent.substring(position.column - 1);

  if (
    (/\*\*[^*]*$/.test(beforeCursor) && /^[^*]*\*\*/.test(afterCursor)) ||
    (/__[^_]*$/.test(beforeCursor) && /^[^_]*__/.test(afterCursor))
  ) {
    formats.add('bold');
  }

  if (
    (/[^*]\*[^*]*$/.test(beforeCursor) && /^[^*]*\*[^*]/.test(afterCursor)) ||
    (/[^_]_[^_]*$/.test(beforeCursor) && /^[^_]*_[^_]/.test(afterCursor))
  ) {
    formats.add('italic');
  }

  if (/~~[^~]*$/.test(beforeCursor) && /^[^~]*~~/.test(afterCursor)) {
    formats.add('strikethrough');
  }

  if (/[^`]`[^`]*$/.test(beforeCursor) && /^[^`]*`[^`]/.test(afterCursor)) {
    formats.add('code');
  }

  return formats;
};

interface AttachEditorContextHandlersArgs {
  editor: EditorLike;
  setIsInsideTable: (next: boolean) => void;
  setTableLocation: (next: tableService.TableLocation | null) => void;
  setCursorPos: (next: { line: number; col: number }) => void;
  setActiveFormats: (next: Set<string>) => void;
}

export const attachEditorContextHandlers = ({
  editor,
  setIsInsideTable,
  setTableLocation,
  setCursorPos,
  setActiveFormats
}: AttachEditorContextHandlersArgs) => {
  const run = (position: any) => {
    const model = editor.getModel();
    if (!model || !position) return;

    const loc = tableService.getTableCellLocation(model, position);
    setIsInsideTable(loc.isInTable);
    setTableLocation(loc);
    setCursorPos({ line: position.lineNumber, col: position.column });
    setActiveFormats(computeActiveFormats(model, position));
  };

  const initialPos = editor.getPosition?.();
  if (initialPos) run(initialPos);

  const disposable = editor.onDidChangeCursorPosition(e => {
    run(e.position);
  });

  return () => disposable.dispose();
};
