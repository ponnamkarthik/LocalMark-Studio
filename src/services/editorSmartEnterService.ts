import * as tableService from './tableService';

type EditorLike = {
  getModel: () => any;
  getPosition: () => any;
  executeEdits: (source: string, edits: any[]) => void;
  setPosition: (pos: any) => void;
  onKeyDown: (cb: (e: any) => void) => { dispose: () => void };
};

export const attachSmartEnterHandler = ({ editor, monaco }: { editor: EditorLike; monaco: any }) => {
  const disposable = editor.onKeyDown((e: any) => {
    const model = editor.getModel();
    const pos = editor.getPosition();
    if (!model || !pos) return;

    if (e.keyCode !== 3 /* Enter */ || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    if (tableService.isCursorInTable(model, pos)) {
      e.preventDefault();
      e.stopPropagation();

      tableService.formatTableAtCursor(model, pos);

      const edit = tableService.insertRow(model, pos, 'below');
      if (edit) {
        editor.executeEdits('table-enter', [edit]);

        const nextRowLine = pos.lineNumber + 1;
        const nextLineContent = model.getLineContent(nextRowLine);
        const firstPipeIdx = nextLineContent.indexOf('|');

        if (firstPipeIdx !== -1) {
          editor.setPosition({ lineNumber: nextRowLine, column: firstPipeIdx + 3 });
        }
      }
      return;
    }

    const lineContent = model.getLineContent(pos.lineNumber);
    const listMatch = lineContent.match(/^(\s*)([-*+]|\d+\.)(\s+)(\[[ xX]?\]\s+)?/);

    if (!listMatch) return;

    const [fullMatch, indent, marker, space, taskBox] = listMatch;
    const isTask = !!taskBox;
    const isOrdered = /^\d+\.$/.test(marker);

    if (lineContent.trim().length === fullMatch.trim().length) {
      e.preventDefault();
      e.stopPropagation();
      const range = new monaco.Range(pos.lineNumber, 1, pos.lineNumber, lineContent.length + 1);
      editor.executeEdits('smart-list-break', [
        { range, text: '', forceMoveMarkers: true },
        { range: new monaco.Range(pos.lineNumber, 1, pos.lineNumber, 1), text: '\n', forceMoveMarkers: true }
      ]);
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    let nextMarker = marker;
    if (isOrdered) {
      const currentNum = parseInt(marker, 10);
      nextMarker = `${currentNum + 1}.`;
    }

    const nextTaskBox = isTask ? '[ ] ' : '';
    const insertText = `\n${indent}${nextMarker}${space}${nextTaskBox}`;
    editor.executeEdits('smart-list-continue', [
      {
        range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
        text: insertText,
        forceMoveMarkers: true
      }
    ]);
  });

  return () => disposable.dispose();
};

