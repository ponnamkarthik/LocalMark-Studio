
export type NodeType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  content: string; // Empty string for folders
  tags?: string[]; // Array of tag strings
  metadata?: Record<string, string>; // Custom key-value pairs
  createdAt: number;
  updatedAt: number;
  isOpen?: boolean; // UI state, persisted for session restoration
}

export interface FileTreeItem extends FileNode {
  children?: FileTreeItem[];
  depth: number;
  expanded?: boolean;
}

export interface EditorSettings {
  wordWrap: 'on' | 'off';
  minimap: boolean;
  fontSize: number;
}

export interface MarkdownFeatures {
    mermaid: boolean;
    math: boolean;
    callouts: boolean;
    footnotes: boolean;
}

export type PreviewTheme = 'github' | 'notion' | 'minimal';

export interface ScrollPosition {
    line: number;
    column: number;
}

// Simple event bus for communication between non-child components
export type EventType = 'SAVE_FILE' | 'DELETE_FILE';