import { createContext, useContext } from "react";
import {
  FileNode,
  FileTreeItem,
  ScrollPosition,
  MarkdownFeatures,
  PreviewTheme,
} from "./types";

export interface AppContextType {
  files: FileNode[];
  activeFileId: string | null;
  expandedFolders: Set<string>;
  showPreview: boolean;
  showSidebar: boolean;
  features: MarkdownFeatures;
  previewTheme: PreviewTheme;
  refreshFiles: () => Promise<void>;
  createFile: (
    parentId: string | null,
    name: string,
    type: "file" | "folder"
  ) => Promise<void>;
  importFile: (name: string, content: string) => Promise<void>;
  openImport: () => void;
  updateFileContent: (id: string, content: string) => Promise<void>;
  updateFileMetadata: (
    id: string,
    tags: string[],
    metadata: Record<string, string>
  ) => Promise<void>;
  renameNode: (id: string, newName: string) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  setActiveFile: (id: string | null) => void;
  toggleFolder: (id: string) => void;
  togglePreview: () => void;
  toggleSidebar: () => void;
  toggleFeature: (key: keyof MarkdownFeatures) => void;
  setPreviewTheme: (theme: PreviewTheme) => void;
  openPalette: () => void;
  openMetadata: () => void;
  fileTree: FileTreeItem[];
  pendingScroll: ScrollPosition | null;
  setPendingScroll: (pos: ScrollPosition | null) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
