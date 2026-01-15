import React, { useState, useRef, useEffect } from "react";
import {
  PenLine,
  Github,
  Download,
  ChevronDown,
  FileJson,
  FileType,
  Printer,
  FileCode,
  Upload,
  Search,
  Info,
} from "lucide-react";
import { useApp } from "../AppContext";
import { exportService } from "../services/exportService";
import { htmlToMarkdown } from "../services/turndownService";

const Header: React.FC = () => {
  const {
    files,
    activeFileId,
    importFile,
    openPalette,
    previewTheme,
    openMetadata,
  } = useApp();
  const activeFile = files.find((f) => f.id === activeFileId);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (type: "md" | "html" | "pdf" | "json") => {
    if (!activeFile) return;

    switch (type) {
      case "md":
        exportService.exportMarkdown(activeFile);
        break;
      case "html":
        exportService.exportHTML(activeFile, previewTheme);
        break;
      case "pdf":
        exportService.exportPDF(activeFile, previewTheme);
        break;
      case "json":
        exportService.exportJSON(activeFile);
        break;
    }
    setIsExportOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const ExportOption = ({
    icon: Icon,
    label,
    desc,
    colorClass,
    onClick,
  }: {
    icon: any;
    label: string;
    desc: string;
    colorClass: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-theme-hover transition-all group text-left border border-transparent hover:border-theme-border/50"
    >
      <div
        className={`p-2 rounded-md bg-theme-bg border border-theme-border group-hover:border-theme-border/80 transition-colors shrink-0 ${colorClass}`}
      >
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-theme-text-main group-hover:text-white leading-none mb-1">
          {label}
        </div>
        <div className="text-[11px] text-theme-text-muted truncate group-hover:text-theme-text-dim leading-none opacity-80">
          {desc}
        </div>
      </div>
    </button>
  );

  return (
    <div className="h-12 bg-theme-header border-b border-theme-border flex items-center justify-between px-4 select-none shrink-0 z-10 relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".md,.markdown,.txt,.html,.htm"
      />

      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-tr from-emerald-500 to-green-400 rounded-lg blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative bg-linear-to-br from-emerald-500 to-green-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20 ring-1 ring-white/10">
            <PenLine
              size={16}
              className="text-white relative z-10 transform group-hover:-rotate-12 transition-transform duration-300"
              strokeWidth={2.5}
            />
          </div>
        </div>
        <div>
          <h1 className="text-sm font-bold text-theme-text-main tracking-wide leading-none">
            LocalMark
          </h1>
          <p className="text-[10px] text-theme-text-muted uppercase tracking-wider font-semibold mt-0.5">
            Studio
          </p>
        </div>
      </div>

      {/* Search / Command Trigger */}
      <button
        onClick={openPalette}
        className="flex-1 max-w-md mx-6 bg-theme-activity border border-theme-border rounded-md px-3 py-1.5 flex items-center gap-2 group hover:border-theme-accent/50 transition-colors"
      >
        <Search
          size={14}
          className="text-theme-text-muted group-hover:text-theme-text-main"
        />
        <span className="text-xs text-theme-text-muted group-hover:text-theme-text-main">
          Search commands...
        </span>
        <div className="ml-auto flex items-center gap-1">
          <kbd className="hidden sm:inline-block px-1.5 py-px text-[10px] font-mono text-theme-text-dim bg-theme-bg border border-theme-border rounded">
            ⌘
          </kbd>
          <kbd className="hidden sm:inline-block px-1.5 py-px text-[10px] font-mono text-theme-text-dim bg-theme-bg border border-theme-border rounded">
            ⇧
          </kbd>
          <kbd className="hidden sm:inline-block px-1.5 py-px text-[10px] font-mono text-theme-text-dim bg-theme-bg border border-theme-border rounded">
            P
          </kbd>
        </div>
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {activeFile && (
          <>
            <button
              onClick={openMetadata}
              className="p-1.5 rounded-md text-theme-text-muted hover:text-theme-accent hover:bg-theme-activity transition-colors"
              title="File Info & Metadata"
            >
              <Info size={16} />
            </button>
            <div className="w-px h-5 bg-theme-border mx-1 opacity-50" />
          </>
        )}

        <button
          onClick={handleImportClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-theme-activity border border-transparent text-theme-text-muted hover:text-white hover:bg-theme-hover transition-colors"
        >
          <Upload size={14} />
          <span>Import</span>
        </button>

        {activeFile && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border
                        ${
                          isExportOpen
                            ? "bg-theme-active border-theme-border text-white shadow-sm"
                            : "bg-theme-activity border-transparent text-theme-text-muted hover:text-white hover:bg-theme-hover"
                        }
                    `}
            >
              <Download size={14} />
              <span>Export</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${
                  isExportOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isExportOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-[#161b22] border border-theme-border rounded-xl shadow-2xl shadow-black/60 overflow-hidden p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right ring-1 ring-white/5 backdrop-blur-xl">
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider">
                    Document Export
                  </span>
                </div>

                <div className="space-y-0.5">
                  <ExportOption
                    icon={FileType}
                    label="Markdown"
                    desc="Raw source file (.md)"
                    colorClass="text-blue-400"
                    onClick={() => handleExport("md")}
                  />
                  <ExportOption
                    icon={FileCode}
                    label="Styled HTML"
                    desc="Standalone web page with styles"
                    colorClass="text-orange-400"
                    onClick={() => handleExport("html")}
                  />
                  <ExportOption
                    icon={Printer}
                    label="PDF Document"
                    desc="Print-ready formatted document"
                    colorClass="text-emerald-400"
                    onClick={() => handleExport("pdf")}
                  />
                </div>

                <div className="h-px bg-theme-border my-2 mx-2 opacity-50" />

                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider">
                    Data
                  </span>
                </div>

                <div className="space-y-0.5">
                  <ExportOption
                    icon={FileJson}
                    label="JSON Metadata"
                    desc="Full node attributes & content"
                    colorClass="text-yellow-400"
                    onClick={() => handleExport("json")}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="w-px h-5 bg-theme-border mx-1" />

        <a
          href="#"
          className="text-theme-text-muted hover:text-theme-text-main transition-colors"
        >
          <Github size={20} />
        </a>
      </div>
    </div>
  );
};

export default Header;
