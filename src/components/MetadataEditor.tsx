import React, { useState, useEffect } from "react";
import { X, Plus, Tag, Database, Hash } from "lucide-react";
import { FileNode } from "../types";

interface MetadataEditorProps {
  file: FileNode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    tags: string[],
    metadata: Record<string, string>
  ) => void;
}

const MetadataEditor: React.FC<MetadataEditorProps> = ({
  file,
  isOpen,
  onClose,
  onSave,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>(
    []
  );
  const [newTag, setNewTag] = useState("");
  const [newMetaKey, setNewMetaKey] = useState("");
  const [newMetaValue, setNewMetaValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTags(file.tags || []);
      const metaArray = Object.entries(file.metadata || {}).map(
        ([key, value]) => ({ key, value })
      );
      setMetadata(metaArray);
      setNewTag("");
      setNewMetaKey("");
      setNewMetaValue("");
    }
  }, [isOpen, file]);

  const handleAddTag = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddMeta = () => {
    if (newMetaKey.trim()) {
      setMetadata([
        ...metadata,
        { key: newMetaKey.trim(), value: newMetaValue.trim() },
      ]);
      setNewMetaKey("");
      setNewMetaValue("");
    }
  };

  const removeMeta = (index: number) => {
    setMetadata(metadata.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const metaObject = metadata.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    onSave(file.id, tags, metaObject);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-theme-activity border border-theme-border rounded-xl shadow-2xl p-0 overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-theme-header border-b border-theme-border">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-theme-accent" />
            <h2 className="text-sm font-bold text-theme-text-main">
              File Properties
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-theme-text-muted hover:text-theme-text-main transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Tags Section */}
          <div>
            <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider mb-2 block flex items-center gap-1">
              <Hash size={12} /> Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-theme-accent/20 text-theme-accent text-xs border border-theme-accent/30"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-theme-text-main"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="flex-1 bg-theme-bg text-sm px-2 py-1.5 rounded border border-theme-border outline-none focus:border-theme-accent text-theme-text-main"
              />
              <button
                type="submit"
                disabled={!newTag.trim()}
                className="bg-theme-bg border border-theme-border px-2 rounded hover:bg-theme-hover disabled:opacity-50 text-theme-text-muted hover:text-theme-text-main"
              >
                <Plus size={16} />
              </button>
            </form>
          </div>

          <div className="h-px bg-theme-border" />

          {/* Metadata Section */}
          <div>
            <label className="text-xs font-bold text-theme-text-muted uppercase tracking-wider mb-2 block flex items-center gap-1">
              <Tag size={12} /> Key-Value Data
            </label>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto custom-scrollbar">
              {metadata.map((meta, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs group"
                >
                  <span className="font-mono text-theme-text-dim w-1/3 truncate text-right">
                    {meta.key}:
                  </span>
                  <span className="text-theme-text-main flex-1 truncate">
                    {meta.value}
                  </span>
                  <button
                    onClick={() => removeMeta(idx)}
                    className="text-theme-text-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {metadata.length === 0 && (
                <div className="text-xs text-theme-text-dim italic">
                  No custom metadata
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMetaKey}
                onChange={(e) => setNewMetaKey(e.target.value)}
                placeholder="Key (e.g. Author)"
                className="w-1/3 bg-theme-bg text-sm px-2 py-1.5 rounded border border-theme-border outline-none focus:border-theme-accent text-theme-text-main"
              />
              <input
                type="text"
                value={newMetaValue}
                onChange={(e) => setNewMetaValue(e.target.value)}
                placeholder="Value"
                className="flex-1 bg-theme-bg text-sm px-2 py-1.5 rounded border border-theme-border outline-none focus:border-theme-accent text-theme-text-main"
              />
              <button
                onClick={handleAddMeta}
                disabled={!newMetaKey.trim()}
                className="bg-theme-bg border border-theme-border px-2 rounded hover:bg-theme-hover disabled:opacity-50 text-theme-text-muted hover:text-theme-text-main"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-theme-bg border-t border-theme-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-theme-text-muted hover:text-theme-text-main transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs font-medium bg-theme-accent text-white rounded hover:bg-theme-accent/90 transition-colors shadow-lg shadow-theme-accent/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataEditor;
