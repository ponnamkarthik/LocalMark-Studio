import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import dynamic from "next/dynamic";
import { dbService } from "../services/db";
import {
  FileNode,
  ScrollPosition,
  MarkdownFeatures,
  PreviewTheme,
} from "../types";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import CommandPalette from "../components/CommandPalette";
import MetadataEditor from "../components/MetadataEditor";
import { AppContext } from "../AppContext";
import { buildTree } from "../utils/buildTree";
import { useCommandPaletteCommands } from "../hooks/useCommandPaletteCommands";
import { useScrollSync } from "../hooks/useScrollSync";
import { htmlToMarkdown } from "../services/turndownService";
import { requestPersistentStorage } from "../services/storagePersistence";

const EditorArea = dynamic(() => import("../components/EditorArea"), {
  ssr: false,
});
const PreviewArea = dynamic(() => import("../components/PreviewArea"), {
  ssr: false,
});

const EditorApp: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Persistent UI State ---

  // Active File
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Expanded Folders
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  // Layout Preferences
  const [showPreview, setShowPreview] = useState(true);

  const [showSidebar, setShowSidebar] = useState(true);

  // Theme State (App Dark/Light)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";

    try {
      const savedTheme = localStorage.getItem("localmark_theme");
      if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
    } catch {}

    try {
      return "dark";
    } catch {
      return "dark";
    }
  });

  // Preview Theme
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>("github");

  // Markdown Features State
  const [features, setFeatures] = useState<MarkdownFeatures>({
    mermaid: false,
    math: false,
    callouts: false,
    footnotes: false,
  });

  // Modal States
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  // Navigation State
  const [pendingScroll, setPendingScroll] = useState<ScrollPosition | null>(
    null
  );

  // Track the last auto-expanded file to prevent re-expansion on content edits
  const lastAutoExpandedFileIdRef = useRef<string | null>(null);

  const [isHydrated, setIsHydrated] = useState(false);

  // Import picker (shared between Header + Command Palette)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // --- Persistence Effects ---

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedActiveFileId = localStorage.getItem("localmark_activeFileId");
      if (savedActiveFileId) setActiveFileId(savedActiveFileId);
    } catch {}

    try {
      const savedExpandedFolders = localStorage.getItem(
        "localmark_expandedFolders"
      );
      if (savedExpandedFolders) {
        const parsed = JSON.parse(savedExpandedFolders);
        if (Array.isArray(parsed)) setExpandedFolders(new Set(parsed));
      }
    } catch {}

    try {
      const savedShowPreview = localStorage.getItem("localmark_showPreview");
      if (savedShowPreview)
        setShowPreview(Boolean(JSON.parse(savedShowPreview)));
    } catch {}

    try {
      const savedShowSidebar = localStorage.getItem("localmark_showSidebar");
      if (savedShowSidebar)
        setShowSidebar(Boolean(JSON.parse(savedShowSidebar)));
    } catch {}

    try {
      const savedFeatures = localStorage.getItem("localmark_features");
      if (savedFeatures) {
        const parsed = JSON.parse(savedFeatures);
        if (parsed && typeof parsed === "object") {
          setFeatures((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      }
    } catch {}

    try {
      const savedPreviewTheme = localStorage.getItem("localmark_previewTheme");
      if (
        savedPreviewTheme === "github" ||
        savedPreviewTheme === "notion" ||
        savedPreviewTheme === "minimal"
      ) {
        setPreviewTheme(savedPreviewTheme);
      }
    } catch {}

    try {
      const savedTheme = localStorage.getItem("localmark_theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      }
    } catch {}

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (activeFileId)
      localStorage.setItem("localmark_activeFileId", activeFileId);
    else localStorage.removeItem("localmark_activeFileId");
  }, [activeFileId, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(
      "localmark_expandedFolders",
      JSON.stringify(Array.from(expandedFolders))
    );
  }, [expandedFolders, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("localmark_showPreview", JSON.stringify(showPreview));
  }, [showPreview, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("localmark_showSidebar", JSON.stringify(showSidebar));
  }, [showSidebar, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("localmark_features", JSON.stringify(features));
  }, [features, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("localmark_previewTheme", previewTheme);
  }, [previewTheme, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("localmark_theme", theme);
  }, [theme, isHydrated]);

  // Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Auto-expand folders when active file changes
  useEffect(() => {
    if (loading || !activeFileId) return;

    if (lastAutoExpandedFileIdRef.current === activeFileId) return;

    const ancestors = new Set<string>();
    let current = files.find((f) => f.id === activeFileId);

    while (current && current.parentId) {
      ancestors.add(current.parentId);
      // eslint-disable-next-line no-loop-func
      current = files.find((f) => f.id === current?.parentId);
    }

    if (ancestors.size > 0) {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        let hasChanges = false;
        ancestors.forEach((id) => {
          if (!next.has(id)) {
            next.add(id);
            hasChanges = true;
          }
        });
        return hasChanges ? next : prev;
      });
    }

    lastAutoExpandedFileIdRef.current = activeFileId;
  }, [activeFileId, files, loading]);

  // Global Keybinding for Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === "KeyP") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Scroll Sync & Editor Refs ---
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { handleEditorInstanceReady, handlePreviewScroll } = useScrollSync({
    showPreview,
    previewRef,
    editorRef,
    monacoRef,
  });

  // --- Core Logic ---

  const refreshFiles = useCallback(async () => {
    const allFiles = await dbService.getAllFiles();
    // Normalize data (add missing fields for legacy files)
    const normalized = allFiles.map((f) => ({
      ...f,
      tags: f.tags || [],
      metadata: f.metadata || {},
    }));
    setFiles(normalized);
  }, []);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      void requestPersistentStorage();
      await dbService.init();
      await dbService.seedIfEmpty();
      await refreshFiles();
      setLoading(false);
    };
    init();
  }, [refreshFiles]);

  useEffect(() => {
    if (!loading && activeFileId && files.length > 0) {
      const exists = files.some((f) => f.id === activeFileId);
      if (!exists) {
        setActiveFileId(null);
      }
    }
    if (!loading && !activeFileId && files.length > 0) {
      const readme = files.find(
        (f) =>
          f.name.toLowerCase().includes("welcome") ||
          f.name.toLowerCase().includes("readme")
      );
      if (readme) setActiveFileId(readme.id);
      else {
        const firstFile = files.find((f) => f.type === "file");
        if (firstFile) setActiveFileId(firstFile.id);
      }
    }
  }, [loading, files, activeFileId]);

  const createFile = async (
    parentId: string | null,
    name: string,
    type: "file" | "folder"
  ) => {
    const newNode: FileNode = {
      id: crypto.randomUUID(),
      name,
      type,
      parentId,
      content: "",
      tags: [],
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isOpen: type === "file",
    };
    await dbService.saveFile(newNode);
    if (parentId) setExpandedFolders((prev) => new Set(prev).add(parentId));
    await refreshFiles();
    if (type === "file") setActiveFileId(newNode.id);
  };

  const importFile = async (name: string, content: string) => {
    const newNode: FileNode = {
      id: crypto.randomUUID(),
      name,
      type: "file",
      parentId: null,
      content,
      tags: [],
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isOpen: true,
    };
    await dbService.saveFile(newNode);
    await refreshFiles();
    setActiveFileId(newNode.id);
  };

  const handleImportFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        let content = text;
        let name = file.name;

        // If it's an HTML file, convert to Markdown
        if (
          name.toLowerCase().endsWith(".html") ||
          name.toLowerCase().endsWith(".htm")
        ) {
          content = htmlToMarkdown(text);
          name = name.replace(/\.html?$/i, ".md");
        }

        await importFile(name, content);
      } catch (error) {
        console.error("Failed to import file", error);
        alert("Failed to read file.");
      }

      // Reset input so same file can be selected again if needed
      e.target.value = "";
    },
    []
  );

  const updateFileContent = async (id: string, content: string) => {
    const file = files.find((f) => f.id === id);
    if (file) {
      const updated = { ...file, content, updatedAt: Date.now() };
      setFiles((prev) => prev.map((f) => (f.id === id ? updated : f)));
      await dbService.saveFile(updated);
    }
  };

  const updateFileMetadata = async (
    id: string,
    tags: string[],
    metadata: Record<string, string>
  ) => {
    const file = files.find((f) => f.id === id);
    if (file) {
      const updated = { ...file, tags, metadata, updatedAt: Date.now() };
      setFiles((prev) => prev.map((f) => (f.id === id ? updated : f)));
      await dbService.saveFile(updated);
    }
  };

  const renameNode = async (id: string, newName: string) => {
    await dbService.renameFile(id, newName);
    await refreshFiles();
  };

  const moveNode = useCallback(
    async (id: string, newParentId: string | null) => {
      const node = files.find((f) => f.id === id);
      if (!node) return;

      if (newParentId === node.parentId) return;
      if (newParentId === node.id) return;

      if (newParentId) {
        const targetParent = files.find((f) => f.id === newParentId);
        if (!targetParent || targetParent.type !== "folder") return;

        if (node.type === "folder") {
          const descendantIds = new Set<string>();
          const collect = (pid: string) => {
            files
              .filter((f) => f.parentId === pid)
              .forEach((child) => {
                descendantIds.add(child.id);
                if (child.type === "folder") collect(child.id);
              });
          };
          collect(node.id);

          if (descendantIds.has(newParentId)) return;
        }
      }

      const updated: FileNode = {
        ...node,
        parentId: newParentId,
        updatedAt: Date.now(),
      };

      await dbService.saveFile(updated);
      if (newParentId) {
        setExpandedFolders((prev) => new Set(prev).add(newParentId));
      }
      await refreshFiles();
    },
    [files, refreshFiles]
  );

  const deleteNode = useCallback(
    async (id: string) => {
      try {
        const toDelete = [id];
        const findChildren = (pid: string) => {
          files
            .filter((f) => f.parentId === pid)
            .forEach((c) => {
              toDelete.push(c.id);
              if (c.type === "folder") findChildren(c.id);
            });
        };
        findChildren(id);
        for (const delId of toDelete) {
          await dbService.deleteFile(delId);
        }
        if (toDelete.includes(activeFileId || "")) {
          setActiveFileId(null);
        }
        await refreshFiles();
      } catch (error) {
        console.error("Failed to delete node:", error);
        alert("Failed to delete item.");
      }
    },
    [files, activeFileId, refreshFiles]
  );

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePreview = () => setShowPreview(!showPreview);
  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleFeature = (key: keyof MarkdownFeatures) =>
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  const setActiveFile = async (id: string | null) => setActiveFileId(id);
  const openPalette = () => setIsPaletteOpen(true);
  const openMetadata = () => setIsMetadataOpen(true);

  const commands = useCommandPaletteCommands({
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
  });

  const fileTree = buildTree(files);

  if (loading)
    return (
      <div className="h-screen w-full bg-theme-bg flex items-center justify-center text-theme-text-muted">
        Loading LocalMark...
      </div>
    );

  return (
    <AppContext.Provider
      value={{
        files,
        activeFileId,
        expandedFolders,
        showPreview,
        showSidebar,
        theme,
        features,
        previewTheme,
        refreshFiles,
        createFile,
        importFile,
        openImport,
        updateFileContent,
        updateFileMetadata,
        renameNode,
        deleteNode,
        moveNode,
        setActiveFile,
        toggleFolder,
        togglePreview,
        toggleSidebar,
        setTheme,
        toggleTheme,
        toggleFeature,
        setPreviewTheme,
        openPalette,
        openMetadata,
        fileTree,
        pendingScroll,
        setPendingScroll,
      }}
    >
      <div className="flex flex-col h-screen w-screen bg-theme-bg text-theme-text-main overflow-hidden font-sans">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFileSelect}
          className="hidden"
          accept=".md,.markdown,.txt,.html,.htm"
        />
        <Header />

        <div className="flex-1 flex overflow-hidden min-h-0">
          {showSidebar && <Sidebar />}

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex overflow-hidden">
              <div
                className={`flex-1 relative ${
                  showPreview ? "w-1/2" : "w-full"
                }`}
              >
                {activeFileId ? (
                  <EditorArea
                    onInstanceReady={handleEditorInstanceReady}
                    onOpenPalette={openPalette}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-theme-text-muted text-sm">
                    Select a file to start editing
                  </div>
                )}
              </div>
              {showPreview && activeFileId && (
                <div className="w-1/2 border-l border-theme-border bg-theme-bg overflow-hidden flex flex-col">
                  <PreviewArea
                    ref={previewRef}
                    onScroll={handlePreviewScroll}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <CommandPalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          commands={commands}
        />

        {activeFileId && (
          <MetadataEditor
            isOpen={isMetadataOpen}
            onClose={() => setIsMetadataOpen(false)}
            file={files.find((f) => f.id === activeFileId)!}
            onSave={updateFileMetadata}
          />
        )}
      </div>
    </AppContext.Provider>
  );
};

export default EditorApp;
