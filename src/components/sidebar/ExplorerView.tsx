import React, { useState } from 'react';
import { File, Folder, Plus, PlusCircle } from 'lucide-react';
import { useApp } from '../../AppContext';
import FileTreeNode from './FileTreeNode';

const ExplorerView: React.FC = () => {
  const { fileTree, createFile } = useApp();
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [newName, setNewName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !isCreating) return;
    await createFile(null, newName, isCreating);
    setNewName('');
    setIsCreating(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-9 px-3 border-b border-theme-border flex justify-between items-center bg-theme-activity/30 shrink-0">
        <span className="text-xs font-bold tracking-wider text-theme-text-muted uppercase">Folders</span>
        <div className="flex gap-1">
          <button
            onClick={() => setIsCreating('file')}
            className="hover:bg-theme-hover p-1 rounded text-theme-text-muted hover:text-white transition-colors"
            title="New File"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => setIsCreating('folder')}
            className="hover:bg-theme-hover p-1 rounded text-theme-text-muted hover:text-white transition-colors"
            title="New Folder"
          >
            <PlusCircle size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {isCreating && (
          <form onSubmit={handleCreate} className="px-4 py-1 flex items-center gap-2">
            {isCreating === 'file' ? (
              <File size={14} className="text-theme-text-muted" />
            ) : (
              <Folder size={14} className="text-theme-accent" />
            )}
            <input
              autoFocus
              type="text"
              className="bg-theme-activity text-white text-sm w-full px-1 border border-theme-accent outline-none rounded-sm"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onBlur={() => setIsCreating(null)}
              placeholder="Name..."
            />
          </form>
        )}
        {fileTree.map(node => (
          <FileTreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
};

export default ExplorerView;

