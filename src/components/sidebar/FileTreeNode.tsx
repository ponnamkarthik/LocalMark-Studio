import React, { useState } from "react";
import { useApp } from "../../AppContext";
import { FileTreeItem } from "../../types";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  File,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  PlusCircle,
  Trash2,
} from "lucide-react";

interface FileTreeNodeProps {
  node: FileTreeItem;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node }) => {
  const {
    activeFileId,
    expandedFolders,
    toggleFolder,
    setActiveFile,
    deleteNode,
    renameNode,
    createFile,
  } = useApp();

  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [isCreatingChild, setIsCreatingChild] = useState<
    "file" | "folder" | null
  >(null);
  const [childName, setChildName] = useState("");

  const isExpanded = expandedFolders.has(node.id);
  const isActive = activeFileId === node.id;
  const paddingLeft = `${node.depth * 12 + 12}px`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRenaming) return;
    if (node.type === "folder") {
      toggleFolder(node.id);
    } else {
      setActiveFile(node.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const message =
      node.type === "folder"
        ? `Delete folder "${node.name}" and all its contents?`
        : `Delete file "${node.name}"?`;

    if (window.confirm(message)) {
      await deleteNode(node.id);
    }
  };

  const startRenaming = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
    setRenameValue(node.name);
  };

  const handleRenameSubmit = async () => {
    if (renameValue.trim() && renameValue !== node.name) {
      await renameNode(node.id, renameValue);
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
      setRenameValue(node.name);
    }
  };

  const handleAddChild = (e: React.MouseEvent, type: "file" | "folder") => {
    e.stopPropagation();
    if (!isExpanded) toggleFolder(node.id);
    setIsCreatingChild(type);
  };

  const submitChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !isCreatingChild) return;
    await createFile(node.id, childName, isCreatingChild);
    setChildName("");
    setIsCreatingChild(null);
  };

  return (
    <div>
      <div
        className={`
            flex items-center group cursor-pointer text-sm py-1 pr-2 relative transition-colors
            ${
              isActive
                ? "bg-theme-active text-theme-text-main border-l-2 border-theme-accent"
                : "text-theme-text-muted hover:bg-theme-hover hover:text-theme-text-main border-l-2 border-transparent"
            }
        `}
        style={{
          paddingLeft: isActive ? `calc(${paddingLeft} - 2px)` : paddingLeft,
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="mr-1 opacity-80">
          {node.type === "folder" &&
            (isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            ))}
          {node.type === "file" && <span className="w-[14px] inline-block" />}
        </span>

        <span className="mr-2 text-theme-accent opacity-90">
          {node.type === "folder" ? (
            isExpanded ? (
              <FolderOpen size={16} />
            ) : (
              <Folder size={16} />
            )
          ) : (
            <FileText
              size={16}
              className={
                isActive ? "text-theme-text-main" : "text-theme-text-dim"
              }
            />
          )}
        </span>

        {isRenaming ? (
          <input
            type="text"
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-theme-activity text-theme-text-main px-1 outline-none border border-theme-accent rounded-sm h-5 text-sm min-w-0"
          />
        ) : (
          <span className="truncate flex-1">{node.name}</span>
        )}

        {isHovered && !isRenaming && (
          <div className="flex items-center gap-0.5 bg-theme-hover ml-2 shadow-sm rounded-sm overflow-hidden">
            <button
              onClick={startRenaming}
              className="p-1 hover:bg-theme-activity hover:text-theme-text-main text-theme-text-muted transition-colors"
              title="Rename"
            >
              <Edit2 size={13} />
            </button>
            {node.type === "folder" && (
              <>
                <button
                  onClick={(e) => handleAddChild(e, "file")}
                  title="New File"
                  className="p-1 hover:bg-theme-activity hover:text-theme-text-main text-theme-text-muted transition-colors"
                >
                  <Plus size={13} />
                </button>
                <button
                  onClick={(e) => handleAddChild(e, "folder")}
                  title="New Folder"
                  className="p-1 hover:bg-theme-activity hover:text-theme-text-main text-theme-text-muted transition-colors"
                >
                  <PlusCircle size={13} />
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-500/20 hover:text-red-400 text-theme-text-muted transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {isCreatingChild && (
        <form
          onSubmit={submitChild}
          className="flex items-center gap-2 py-1 pr-2 group cursor-pointer"
          style={{ paddingLeft: `${(node.depth + 1) * 12 + 12}px` }}
        >
          {isCreatingChild === "file" ? (
            <File size={14} className="text-theme-text-muted" />
          ) : (
            <Folder size={14} className="text-theme-accent" />
          )}
          <input
            autoFocus
            type="text"
            className="bg-theme-activity text-theme-text-main text-sm w-full px-1 border border-theme-accent outline-none rounded-sm"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            onBlur={() => setIsCreatingChild(null)}
          />
        </form>
      )}

      {node.type === "folder" && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;
