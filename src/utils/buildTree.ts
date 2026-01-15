import { FileNode, FileTreeItem } from '../types';

export const buildTree = (nodes: FileNode[], parentId: string | null = null, depth = 0): FileTreeItem[] => {
  return nodes
    .filter(node => node.parentId === parentId)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map(node => ({
      ...node,
      depth,
      children: node.type === 'folder' ? buildTree(nodes, node.id, depth + 1) : undefined
    }));
};

