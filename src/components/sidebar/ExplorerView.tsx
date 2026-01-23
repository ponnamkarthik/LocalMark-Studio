import React, { useState } from "react";
import { File, FilePlus, Folder, FolderPlus } from "lucide-react";
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useApp } from "../../AppContext";
import FileTreeNode from "./FileTreeNode";

const RootDropZone = ({
  children,
  activeDragId,
}: {
  children: React.ReactNode;
  activeDragId: string | null;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: "root" });

  return (
    <div ref={setNodeRef} className="flex-1 overflow-y-auto custom-scrollbar py-2 relative">
      {isOver && !!activeDragId && (
        <div className="absolute inset-0 bg-theme-hover pointer-events-none" />
      )}
      {children}
    </div>
  );
};

const ExplorerView: React.FC = () => {
  const { fileTree, files, createFile, moveNode } = useApp();
  const [isCreating, setIsCreating] = useState<"file" | "folder" | null>(null);
  const [newName, setNewName] = useState("");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    const collisions = pointerCollisions.length
      ? pointerCollisions
      : rectIntersection(args);

    const overId = getFirstCollision(collisions, "id");
    if (overId === "root" && collisions.length > 1) {
      return collisions.filter((c) => c.id !== "root");
    }

    return collisions;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !isCreating) return;
    await createFile(null, newName, isCreating);
    setNewName("");
    setIsCreating(null);
  };

  const activeDragNode = activeDragId
    ? files.find((f) => f.id === activeDragId)
    : null;

  const onDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveDragId(id);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const draggedId = String(event.active.id);
    const droppedOnId = event.over ? String(event.over.id) : null;

    setActiveDragId(null);

    if (!droppedOnId) return;
    if (draggedId === droppedOnId) return;

    if (droppedOnId === "root") {
      await moveNode(draggedId, null);
      return;
    }

    const target = files.find((f) => f.id === droppedOnId);
    if (!target) return;

    if (target.type === "folder") {
      await moveNode(draggedId, target.id);
      return;
    }

    await moveNode(draggedId, target.parentId ?? null);
  };

  const onDragCancel = () => {
    setActiveDragId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-9 px-3 border-b border-theme-border flex justify-between items-center bg-theme-activity/30 shrink-0">
        <span className="text-xs font-bold tracking-wider text-theme-text-muted uppercase">
          Folders
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setIsCreating("file")}
            className="hover:bg-theme-hover p-1 rounded text-theme-text-muted hover:text-theme-text-main transition-colors"
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={() => setIsCreating("folder")}
            className="hover:bg-theme-hover p-1 rounded text-theme-text-muted hover:text-theme-text-main transition-colors"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <RootDropZone activeDragId={activeDragId}>
          {isCreating && (
            <form
              onSubmit={handleCreate}
              className="px-4 py-1 flex items-center gap-2"
            >
              {isCreating === "file" ? (
                <File size={14} className="text-theme-text-muted" />
              ) : (
                <Folder size={14} className="text-theme-accent" />
              )}
              <input
                autoFocus
                type="text"
                className="bg-theme-activity text-theme-text-main text-sm w-full px-1 border border-theme-accent outline-none rounded-sm"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => setIsCreating(null)}
                placeholder="Name..."
              />
            </form>
          )}

          {fileTree.map((node) => (
            <FileTreeNode
              key={node.id}
              node={node}
              activeDragId={activeDragId}
            />
          ))}
        </RootDropZone>

        <DragOverlay>
          {activeDragNode ? (
            <div className="px-2 py-1 rounded bg-theme-activity border border-theme-border text-xs text-theme-text-main shadow-lg">
              {activeDragNode.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default ExplorerView;
