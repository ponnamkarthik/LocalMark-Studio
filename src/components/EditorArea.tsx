import React, { useRef, useEffect, useState, useMemo } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useApp } from "../AppContext";
import { htmlToMarkdown } from "../services/turndownService";
import { lintMarkdown } from "../services/lintService";
import * as tableService from "../services/tableService";
import { attachMarkdownPasteHandler } from "../services/pasteService";
import { attachEditorContextHandlers } from "../services/editorContextService";
import { attachSmartEnterHandler } from "../services/editorSmartEnterService";
import {
  Bold,
  Italic,
  Strikethrough,
  Type,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Table,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Columns,
  PanelLeft,
  Grid,
  MoveRight,
  MoveLeft,
  ArrowUpToLine,
  ArrowDownToLine,
  Trash,
  TableProperties,
  Clock,
  Network,
  Sigma,
  MessageSquareQuote,
} from "lucide-react";
import { KeyCode, KeyMod } from "monaco-editor";

interface EditorAreaProps {
  onInstanceReady?: (editor: any, monaco: any) => void;
  onOpenPalette?: () => void;
}

const EditorArea: React.FC<EditorAreaProps> = ({
  onInstanceReady,
  onOpenPalette,
}) => {
  const {
    files,
    activeFileId,
    theme,
    updateFileContent,
    showPreview,
    togglePreview,
    toggleSidebar,
    showSidebar,
    pendingScroll,
    setPendingScroll,
    features,
    toggleFeature,
  } = useApp();

  const activeFile = files.find((f) => f.id === activeFileId);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const pasteListenerCleanupRef = useRef<null | (() => void)>(null);
  const cursorListenerCleanupRef = useRef<null | (() => void)>(null);
  const smartEnterCleanupRef = useRef<null | (() => void)>(null);

  // State for Context Awareness
  const [isInsideTable, setIsInsideTable] = useState(false);
  const [tableLocation, setTableLocation] =
    useState<tableService.TableLocation | null>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Table Creator Grid State
  const [isTableGridOpen, setIsTableGridOpen] = useState(false);
  const [hoverGridSize, setHoverGridSize] = useState({ rows: 2, cols: 2 });
  const tableBtnRef = useRef<HTMLDivElement>(null);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

  // Handle pending scroll requests
  useEffect(() => {
    if (pendingScroll && editorRef.current) {
      editorRef.current.revealPositionInCenter({
        lineNumber: pendingScroll.line,
        column: pendingScroll.column,
      });
      editorRef.current.setPosition({
        lineNumber: pendingScroll.line,
        column: pendingScroll.column,
      });
      editorRef.current.focus();
      setPendingScroll(null);
    }
  }, [pendingScroll, activeFileId, setPendingScroll]);

  useEffect(() => {
    return () => {
      pasteListenerCleanupRef.current?.();
      pasteListenerCleanupRef.current = null;
      cursorListenerCleanupRef.current?.();
      cursorListenerCleanupRef.current = null;
      smartEnterCleanupRef.current?.();
      smartEnterCleanupRef.current = null;
    };
  }, []);

  // Linting Effect
  useEffect(() => {
    if (activeFile && editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const markers = lintMarkdown(model);
        monacoRef.current.editor.setModelMarkers(model, "owner", markers);
      }
    }
  }, [activeFile?.content, activeFileId]);

  // Stats Calculation
  const stats = useMemo(() => {
    const text = activeFile?.content || "";
    if (!text) return { words: 0, chars: 0, time: 0 };
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const time = Math.max(1, Math.ceil(words / 200));
    return { words, chars, time };
  }, [activeFile?.content]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (onInstanceReady) onInstanceReady(editor, monaco);

    // Register Command Palette Shortcut (Ctrl/Cmd + Shift + P)
    if (onOpenPalette) {
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP,
        () => {
          onOpenPalette();
        }
      );
      // Also register F1 as it is standard in VS Code
      editor.addCommand(monaco.KeyCode.F1, () => {
        onOpenPalette();
      });
    }

    const pos = editor.getPosition();
    if (pos) {
      setCursorPos({ line: pos.lineNumber, col: pos.column });
      const model = editor.getModel();
      if (model) {
        setActiveFormats(new Set());
      }
    }

    cursorListenerCleanupRef.current?.();
    cursorListenerCleanupRef.current = attachEditorContextHandlers({
      editor,
      setIsInsideTable,
      setTableLocation,
      setCursorPos,
      setActiveFormats,
    });

    smartEnterCleanupRef.current?.();
    smartEnterCleanupRef.current = attachSmartEnterHandler({ editor, monaco });

    pasteListenerCleanupRef.current?.();
    pasteListenerCleanupRef.current = null;
    pasteListenerCleanupRef.current = attachMarkdownPasteHandler({
      editor,
      monaco,
      convertHtmlToMarkdown: htmlToMarkdown,
    });
  };

  const handleTableAction = (
    action:
      | "fmt"
      | "row-up"
      | "row-down"
      | "del-row"
      | "col-left"
      | "col-right"
      | "del-col"
  ) => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    const pos = editor.getPosition();
    if (!model || !pos) return;

    let edit: { range: any; text: string } | undefined;

    switch (action) {
      case "fmt":
        edit = tableService.formatTableAtCursor(model, pos);
        break;
      case "row-up":
        edit = tableService.insertRow(model, pos, "above");
        break;
      case "row-down":
        edit = tableService.insertRow(model, pos, "below");
        break;
      case "del-row":
        edit = tableService.deleteRow(model, pos);
        break;
      case "col-left":
        edit = tableService.insertColumn(model, pos, "left");
        break;
      case "col-right":
        edit = tableService.insertColumn(model, pos, "right");
        break;
      case "del-col":
        edit = tableService.deleteColumn(model, pos);
        break;
    }

    if (edit) {
      editor.executeEdits("table-toolbar", [edit]);
      editor.focus();
    }
  };

  const insertNewTable = (rows: number, cols: number) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    // Determine insertion range
    let range: any = null;
    const selection = editor.getSelection();

    if (selection && !selection.isEmpty()) {
      range = selection;
    } else {
      // If no selection, use the current position (or last known)
      const pos =
        editor.getPosition() ||
        new monaco.Position(cursorPos.line, cursorPos.col);
      if (pos) {
        range = new monaco.Range(
          pos.lineNumber,
          pos.column,
          pos.lineNumber,
          pos.column
        );
      } else {
        // Fail-safe
        range = new monaco.Range(1, 1, 1, 1);
      }
    }

    const tableText = tableService.createTable(rows, cols);

    // Execute Edits
    editor.executeEdits("insert-table", [
      {
        range: range,
        text: tableText,
        forceMoveMarkers: true,
      },
    ]);

    // Cleanup
    setIsTableGridOpen(false);
    editor.focus();
  };

  const insertTemplate = (type: "mermaid" | "math" | "callout") => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const selection = editor.getSelection();
    const pos = editor.getPosition();
    const range =
      selection ||
      new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);

    let text = "";
    if (type === "mermaid") {
      text =
        "\n```mermaid\ngraph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;\n```\n";
      if (!features.mermaid) toggleFeature("mermaid");
    } else if (type === "math") {
      text = " $$ x = y^2 $$ ";
      if (!features.math) toggleFeature("math");
    } else if (type === "callout") {
      text = "\n> [!NOTE]\n> Content here\n";
      if (!features.callouts) toggleFeature("callouts");
    }

    editor.executeEdits("insert-template", [
      { range, text, forceMoveMarkers: true },
    ]);
    editor.focus();
  };

  const insertFormat = (type: string) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const selection = editor.getSelection();
    if (!selection) return;
    const model = editor.getModel();
    if (!model) return;
    const text = model.getValueInRange(selection);

    if (type === "undo") {
      editor.trigger("toolbar", "undo", null);
      editor.focus();
      return;
    }
    if (type === "redo") {
      editor.trigger("toolbar", "redo", null);
      editor.focus();
      return;
    }

    let newText = text;
    let range = selection;

    const runLineAction = (prefix: string) => {
      const startLine = selection.startLineNumber;
      const endLine = selection.endLineNumber;
      const edits = [];
      for (let i = startLine; i <= endLine; i++) {
        const lineContent = model.getLineContent(i);
        if (lineContent.startsWith(prefix)) {
          edits.push({
            range: new monaco.Range(i, 1, i, 1 + prefix.length),
            text: "",
            forceMoveMarkers: true,
          });
        } else {
          edits.push({
            range: new monaco.Range(i, 1, i, 1),
            text: prefix,
            forceMoveMarkers: true,
          });
        }
      }
      editor.executeEdits("toolbar", edits);
    };

    switch (type) {
      case "bold":
        newText = `**${text || "bold"}**`;
        editor.executeEdits("toolbar", [
          { range, text: newText, forceMoveMarkers: true },
        ]);
        break;
      case "italic":
        newText = `_${text || "italic"}_`;
        editor.executeEdits("toolbar", [
          { range, text: newText, forceMoveMarkers: true },
        ]);
        break;
      case "strikethrough":
        newText = `~~${text || "text"}~~`;
        editor.executeEdits("toolbar", [
          { range, text: newText, forceMoveMarkers: true },
        ]);
        break;
      case "heading":
        runLineAction("### ");
        break;
      case "list-ul":
        runLineAction("- ");
        break;
      case "list-ol":
        runLineAction("1. ");
        break;
      case "checklist":
        runLineAction("- [ ] ");
        break;
      case "quote":
        runLineAction("> ");
        break;
      case "code":
        if (selection.startLineNumber !== selection.endLineNumber)
          newText = `\`\`\`\n${text}\n\`\`\``;
        else newText = `\`${text || "code"}\``;
        editor.executeEdits("toolbar", [
          { range, text: newText, forceMoveMarkers: true },
        ]);
        break;
      case "link":
        newText = `[${text || "Link Text"}](https://example.com)`;
        editor.executeEdits("toolbar", [
          { range, text: newText, forceMoveMarkers: true },
        ]);
        break;
      case "image":
        newText = `![${text || "Alt Text"}](https://example.com/image.png)`;
        editor.executeEdits("toolbar", [
          { range, text: newText, forceMoveMarkers: true },
        ]);
        break;
    }
    editor.focus();
  };

  const ToolbarButton = ({
    icon: Icon,
    action,
    title,
    colorClass,
    active,
  }: {
    icon: any;
    action: any;
    title: string;
    colorClass?: string;
    active?: boolean;
  }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        typeof action === "string" ? insertFormat(action) : action();
      }}
      className={`p-1.5 rounded-md transition-colors ${
        active ? "bg-theme-active text-theme-text-main" : "hover:bg-theme-hover"
      } ${colorClass || "text-theme-text-muted hover:text-theme-text-main"}`}
      title={title}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );

  const Separator = () => <div className="w-px h-4 bg-theme-border mx-1" />;

  // Grid Picker Component
  const TableGridPicker = () => (
    <div
      className="fixed bg-theme-activity border border-theme-border rounded-lg shadow-xl p-2 z-9999 w-32"
      style={{ top: pickerPos.top, left: pickerPos.left }}
      // Prevent click propagation at container level
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="mb-2 text-[10px] text-center text-theme-text-muted font-bold">
        {hoverGridSize.rows} x {hoverGridSize.cols}
      </div>
      <div
        className="grid grid-cols-5 gap-1"
        onMouseLeave={() => setHoverGridSize({ rows: 2, cols: 2 })}
      >
        {[...Array(25)].map((_, i) => {
          const r = Math.floor(i / 5) + 1;
          const c = (i % 5) + 1;
          const isActive = r <= hoverGridSize.rows && c <= hoverGridSize.cols;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoverGridSize({ rows: r, cols: c })}
              // Use onMouseDown to trigger action BEFORE focus loss occurs fully
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                insertNewTable(r, c);
              }}
              className={`w-4 h-4 rounded-sm cursor-pointer border transition-colors ${
                isActive
                  ? "bg-theme-accent border-theme-accent"
                  : "bg-theme-bg border-theme-border"
              }`}
            />
          );
        })}
      </div>
    </div>
  );

  if (!activeFile) return null;

  return (
    <div className="h-full w-full flex flex-col bg-theme-bg">
      {/* Toolbar */}
      <div
        className="h-[45px] flex items-center gap-0.5 px-2 bg-theme-activity border-b border-theme-border overflow-x-auto overflow-y-hidden custom-scrollbar shrink-0"
        onClick={() => setIsTableGridOpen(false)}
      >
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-md hover:bg-theme-hover transition-colors ${
            !showSidebar ? "text-theme-text-muted" : "text-theme-text-main"
          }`}
          title="Toggle Explorer"
        >
          <PanelLeft size={16} strokeWidth={2} />
        </button>
        <Separator />

        <ToolbarButton icon={Undo} action="undo" title="Undo" />
        <ToolbarButton icon={Redo} action="redo" title="Redo" />
        <Separator />
        <ToolbarButton
          icon={Bold}
          action="bold"
          title="Bold"
          active={activeFormats.has("bold")}
        />
        <ToolbarButton
          icon={Italic}
          action="italic"
          title="Italic"
          active={activeFormats.has("italic")}
        />
        <ToolbarButton
          icon={Type}
          action="heading"
          title="Heading"
          active={activeFormats.has("heading")}
        />
        <ToolbarButton
          icon={Strikethrough}
          action="strikethrough"
          title="Strikethrough"
          active={activeFormats.has("strikethrough")}
        />
        <Separator />
        <ToolbarButton
          icon={List}
          action="list-ul"
          title="Unordered List"
          active={activeFormats.has("list-ul")}
        />
        <ToolbarButton
          icon={ListOrdered}
          action="list-ol"
          title="Ordered List"
          active={activeFormats.has("list-ol")}
        />
        <ToolbarButton
          icon={CheckSquare}
          action="checklist"
          title="Task List"
          active={activeFormats.has("checklist")}
        />
        <Separator />
        <ToolbarButton
          icon={Quote}
          action="quote"
          title="Blockquote"
          active={activeFormats.has("quote")}
        />
        <ToolbarButton
          icon={Code}
          action="code"
          title="Code"
          active={activeFormats.has("code") || activeFormats.has("code-block")}
        />

        {/* Table Button with Dropdown */}
        <div className="relative" ref={tableBtnRef}>
          <ToolbarButton
            icon={Table}
            action={() => {
              if (tableBtnRef.current) {
                const rect = tableBtnRef.current.getBoundingClientRect();
                setPickerPos({ top: rect.bottom + 4, left: rect.left });
              }
              setIsTableGridOpen(!isTableGridOpen);
            }}
            title="Insert Table"
            active={isTableGridOpen || isInsideTable}
          />
          {isTableGridOpen && <TableGridPicker />}
        </div>

        {/* Advanced Feature Inserts */}
        <ToolbarButton
          icon={Network}
          action={() => insertTemplate("mermaid")}
          title="Insert Mermaid Diagram"
          active={features.mermaid && activeFormats.has("code-block")}
        />
        <ToolbarButton
          icon={Sigma}
          action={() => insertTemplate("math")}
          title="Insert Math Equation"
          active={features.math}
        />
        <ToolbarButton
          icon={MessageSquareQuote}
          action={() => insertTemplate("callout")}
          title="Insert Callout"
          active={features.callouts}
        />

        <Separator />
        <ToolbarButton icon={LinkIcon} action="link" title="Link" />
        <ToolbarButton icon={ImageIcon} action="image" title="Image" />

        {/* Dynamic Table Toolbar */}
        {isInsideTable && (
          <>
            <Separator />
            <div className="flex items-center gap-0.5 bg-theme-bg/50 rounded-md px-1 border border-theme-accent/30 animate-in fade-in zoom-in-95 duration-200">
              <span className="text-[10px] font-bold text-theme-accent px-1 uppercase">
                Table
              </span>
              <ToolbarButton
                icon={TableProperties}
                action={() => handleTableAction("fmt")}
                title="Format Table"
                colorClass="text-theme-accent"
              />
              <div className="w-px h-3 bg-theme-border mx-0.5" />
              <ToolbarButton
                icon={ArrowUpToLine}
                action={() => handleTableAction("row-up")}
                title="Insert Row Above"
              />
              <ToolbarButton
                icon={ArrowDownToLine}
                action={() => handleTableAction("row-down")}
                title="Insert Row Below"
              />
              <ToolbarButton
                icon={Trash}
                action={() => handleTableAction("del-row")}
                title="Delete Row"
                colorClass="text-red-400 hover:text-red-300"
              />
              <div className="w-px h-3 bg-theme-border mx-0.5" />
              <ToolbarButton
                icon={MoveLeft}
                action={() => handleTableAction("col-left")}
                title="Insert Column Left"
              />
              <ToolbarButton
                icon={MoveRight}
                action={() => handleTableAction("col-right")}
                title="Insert Column Right"
              />
              <ToolbarButton
                icon={Trash}
                action={() => handleTableAction("del-col")}
                title="Delete Column"
                colorClass="text-red-400 hover:text-red-300"
              />
            </div>
          </>
        )}

        <div className="ml-auto pl-2 border-l border-theme-border flex items-center">
          <button
            onClick={togglePreview}
            className={`p-1.5 rounded-md hover:bg-theme-hover transition-colors ${
              showPreview ? "text-theme-accent" : "text-theme-text-muted"
            }`}
            title="Toggle Preview"
          >
            <Columns size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          width="100%"
          theme={theme === "dark" ? "vs-dark" : "vs"}
          path={activeFile.id}
          defaultLanguage="markdown"
          value={activeFile.content}
          onChange={(value) => updateFileContent(activeFile.id, value || "")}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            fontSize: 14,
            fontFamily:
              "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            roundedSelection: false,
            cursorStyle: "line",
            cursorBlinking: "smooth",
            renderLineHighlight: "none",
            renderValidationDecorations: "on",
            // Inline Formatting Helpers
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoSurround: "languageDefined",
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-theme-activity border-t border-theme-border flex items-center px-3 text-[10px] text-theme-text-muted select-none gap-4 shrink-0">
        <div className="flex items-center gap-1.5 hover:text-theme-text-main transition-colors">
          <span className="font-semibold">{stats.words}</span> words
        </div>
        <div className="flex items-center gap-1.5 hover:text-theme-text-main transition-colors">
          <span className="font-semibold">{stats.chars}</span> chars
        </div>
        <div
          className="flex items-center gap-1.5 hover:text-theme-text-main transition-colors"
          title="Estimated reading time"
        >
          <Clock size={10} />
          <span>{stats.time} min read</span>
        </div>

        <div className="flex-1" />

        {/* Contextual Info */}
        {isInsideTable && tableLocation ? (
          <div className="flex items-center gap-2 text-theme-accent font-medium animate-in fade-in">
            <Table size={10} />
            <span>
              Row {tableLocation.rowIndex}/{tableLocation.totalRows}, Col{" "}
              {tableLocation.colIndex}/{tableLocation.totalCols}
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 hover:text-theme-text-main transition-colors cursor-pointer"
            title="Go to Line"
          >
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
          </div>
        )}

        <div className="text-theme-text-dim">Markdown</div>
        <div className="text-theme-text-dim">UTF-8</div>
      </div>
    </div>
  );
};

export default EditorArea;
