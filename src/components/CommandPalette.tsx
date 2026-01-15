import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, Command } from "lucide-react";

export interface PaletteCommand {
  id: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
  shortcut?: string;
  group: "navigation" | "editor" | "general" | "files";
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: PaletteCommand[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        (cmd.description && cmd.description.toLowerCase().includes(lowerQuery))
    );
  }, [query, commands]);

  // Reset selection on query change or open
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      // Small delay to ensure render
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + filteredCommands.length) % filteredCommands.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-theme-activity border border-theme-border rounded-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-theme-border gap-3 bg-theme-header">
          <Search className="text-theme-text-muted" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-theme-text-main placeholder-theme-text-dim text-lg"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-theme-bg border border-theme-border text-[10px] text-theme-text-muted font-mono">
              Esc
            </kbd>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto custom-scrollbar p-2"
          ref={listRef}
        >
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-theme-text-muted">
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon || Command;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isSelected
                      ? "bg-theme-accent text-white"
                      : "text-theme-text-muted hover:bg-theme-hover hover:text-theme-text-main"
                  }`}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div
                    className={`p-1 rounded ${
                      isSelected ? "text-white" : "text-theme-text-dim"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm leading-tight">
                      {cmd.label}
                    </div>
                    {cmd.description && (
                      <div
                        className={`text-xs truncate mt-0.5 ${
                          isSelected ? "text-white/80" : "text-theme-text-dim"
                        }`}
                      >
                        {cmd.description}
                      </div>
                    )}
                  </div>
                  {cmd.shortcut && (
                    <div
                      className={`text-xs font-mono px-1.5 py-0.5 rounded border ${
                        isSelected
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-theme-border bg-theme-bg text-theme-text-dim"
                      }`}
                    >
                      {cmd.shortcut}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-1.5 bg-theme-header border-t border-theme-border flex justify-between items-center text-[10px] text-theme-text-dim">
          <span>{filteredCommands.length} commands</span>
          <div className="flex gap-2">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
