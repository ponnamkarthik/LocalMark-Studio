import {
  useMemo,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import {
  Table,
  FileText,
  Eye,
  EyeOff,
  PanelLeft,
  Download,
  Upload,
  Sun,
  Moon,
  RefreshCw,
  FilePlus,
  FolderPlus,
  Sigma,
  Split,
  AlertCircle,
  Footprints,
  Palette,
  Info,
} from "lucide-react";
import * as tableService from "../services/tableService";
import { htmlToMarkdown } from "../services/turndownService";
import { exportService } from "../services/exportService";
import { FileNode, MarkdownFeatures, PreviewTheme } from "../types";
import { PaletteCommand } from "../components/CommandPalette";

interface UseCommandPaletteCommandsArgs {
  files: FileNode[];
  activeFileId: string | null;
  showPreview: boolean;
  showSidebar: boolean;
  theme: "dark" | "light";
  features: MarkdownFeatures;
  previewTheme: PreviewTheme;
  editorRef: MutableRefObject<any>;
  monacoRef: MutableRefObject<any>;
  createFile: (
    parentId: string | null,
    name: string,
    type: "file" | "folder"
  ) => Promise<void>;
  openImport?: () => void;
  refreshFiles?: () => Promise<void>;
  renameNode?: (id: string, newName: string) => Promise<void>;
  deleteNode?: (id: string) => Promise<void>;
  togglePreview: () => void;
  toggleSidebar: () => void;
  setTheme: Dispatch<SetStateAction<"dark" | "light">>;
  setPreviewTheme: (theme: PreviewTheme) => void;
  toggleFeature: (key: keyof MarkdownFeatures) => void;
  openMetadata: () => void;
  setActiveFileId: (id: string | null) => void;
}

export function useCommandPaletteCommands({
  files,
  activeFileId,
  showPreview,
  showSidebar,
  theme,
  features,
  previewTheme,
  editorRef,
  monacoRef,
  createFile,
  openImport,
  refreshFiles,
  renameNode,
  deleteNode,
  togglePreview,
  toggleSidebar,
  setTheme,
  setPreviewTheme,
  toggleFeature,
  openMetadata,
  setActiveFileId,
}: UseCommandPaletteCommandsArgs): PaletteCommand[] {
  return useMemo(() => {
    const activeFile = files.find((f) => f.id === activeFileId);

    const cmds: PaletteCommand[] = [
      ...(openImport
        ? [
            {
              id: "import-file",
              label: "Import File",
              description:
                "Import .md or HTML (auto-convert) into your workspace",
              group: "general",
              icon: Upload,
              action: openImport,
            } as PaletteCommand,
          ]
        : []),
      ...(refreshFiles
        ? [
            {
              id: "refresh-files",
              label: "Refresh Files",
              description: "Reload the file list from local storage",
              group: "general",
              icon: RefreshCw,
              action: () => void refreshFiles(),
            } as PaletteCommand,
          ]
        : []),
      {
        id: "insert-table",
        label: "Insert Table (3x3)",
        description: "Insert a standard 3x3 table at cursor",
        group: "editor",
        icon: Table,
        action: () => {
          const editor = editorRef.current;
          const monaco = monacoRef.current;
          if (editor && monaco) {
            const pos = editor.getPosition();
            if (pos) {
              const table = tableService.createTable(3, 3);
              editor.executeEdits("palette", [
                {
                  range: new monaco.Range(
                    pos.lineNumber,
                    pos.column,
                    pos.lineNumber,
                    pos.column
                  ),
                  text: table,
                  forceMoveMarkers: true,
                },
              ]);
              editor.focus();
            }
          }
        },
      },
      {
        id: "convert-selection",
        label: "Convert Selection to Markdown",
        description: "Convert selected HTML/Rich Text to Markdown",
        group: "editor",
        icon: RefreshCw,
        action: () => {
          const editor = editorRef.current;
          if (editor) {
            const selection = editor.getSelection();
            const model = editor.getModel();
            if (selection && !selection.isEmpty() && model) {
              const text = model.getValueInRange(selection);
              const md = htmlToMarkdown(text);
              editor.executeEdits("palette", [
                {
                  range: selection,
                  text: md,
                  forceMoveMarkers: true,
                },
              ]);
              editor.focus();
            }
          }
        },
      },
      {
        id: "toggle-preview",
        label: showPreview ? "Hide Preview" : "Show Preview",
        group: "general",
        icon: showPreview ? EyeOff : Eye,
        shortcut: "Ctrl+P",
        action: togglePreview,
      },
      {
        id: "toggle-sidebar",
        label: showSidebar ? "Hide Sidebar" : "Show Sidebar",
        group: "general",
        icon: PanelLeft,
        action: toggleSidebar,
      },
      {
        id: "toggle-theme",
        label: `Switch to ${theme === "dark" ? "Light" : "Dark"} Theme`,
        group: "general",
        icon: theme === "dark" ? Sun : Moon,
        action: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      },
      {
        id: "file-metadata",
        label: "File Properties & Tags",
        description: "Edit tags and custom metadata",
        group: "general",
        icon: Info,
        action: openMetadata,
      },
      {
        id: "theme-github",
        label: "Preview Theme: GitHub",
        group: "general",
        icon: Palette,
        action: () => setPreviewTheme("github"),
      },
      {
        id: "theme-notion",
        label: "Preview Theme: Notion",
        group: "general",
        icon: Palette,
        action: () => setPreviewTheme("notion"),
      },
      {
        id: "theme-minimal",
        label: "Preview Theme: Minimal",
        group: "general",
        icon: Palette,
        action: () => setPreviewTheme("minimal"),
      },
      {
        id: "create-file",
        label: "New File",
        group: "general",
        icon: FilePlus,
        action: () => void createFile(null, "Untitled", "file"),
      },
      {
        id: "create-folder",
        label: "New Folder",
        group: "general",
        icon: FolderPlus,
        action: () => void createFile(null, "New Folder", "folder"),
      },
      {
        id: "toggle-mermaid",
        label: `${features.mermaid ? "Disable" : "Enable"} Mermaid Diagrams`,
        description: "Render flowcharts and diagrams",
        group: "general",
        icon: Split,
        action: () => toggleFeature("mermaid"),
      },
      {
        id: "toggle-math",
        label: `${features.math ? "Disable" : "Enable"} Math Support`,
        description: "Render LaTeX equations (KaTeX)",
        group: "general",
        icon: Sigma,
        action: () => toggleFeature("math"),
      },
      {
        id: "toggle-callouts",
        label: `${features.callouts ? "Disable" : "Enable"} Callouts`,
        description: "Render GitHub-style alerts/callouts",
        group: "general",
        icon: AlertCircle,
        action: () => toggleFeature("callouts"),
      },
      {
        id: "toggle-footnotes",
        label: `${features.footnotes ? "Disable" : "Enable"} Footnotes`,
        description: "Render standard markdown footnotes",
        group: "general",
        icon: Footprints,
        action: () => toggleFeature("footnotes"),
      },
      {
        id: "export-md",
        label: "Export to Markdown",
        group: "general",
        icon: Download,
        action: () => activeFile && exportService.exportMarkdown(activeFile),
      },
      {
        id: "export-html",
        label: "Export to HTML",
        group: "general",
        icon: Download,
        action: () =>
          activeFile &&
          exportService.exportHTML(activeFile, previewTheme, {
            math: features.math,
          }),
      },
      {
        id: "export-pdf",
        label: "Export to PDF",
        group: "general",
        icon: Download,
        action: () =>
          activeFile &&
          exportService.exportPDF(activeFile, previewTheme, {
            math: features.math,
          }),
      },
    ];

    files.forEach((f) => {
      if (f.type === "file") {
        cmds.push({
          id: `goto-${f.id}`,
          label: f.name,
          description: "Jump to file",
          group: "files",
          icon: FileText,
          action: () => setActiveFileId(f.id),
        });
      }
    });

    return cmds;
  }, [
    files,
    activeFileId,
    showPreview,
    showSidebar,
    theme,
    features,
    previewTheme,
    createFile,
    openImport,
    refreshFiles,
    renameNode,
    deleteNode,
    togglePreview,
    toggleSidebar,
    setTheme,
    setPreviewTheme,
    toggleFeature,
    openMetadata,
    setActiveFileId,
    editorRef,
    monacoRef,
  ]);
}
