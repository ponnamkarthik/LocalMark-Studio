import { FileNode } from "../types";

const DB_NAME = "LocalMarkDB";
const DB_VERSION = 1;
const STORE_NAME = "files";

const SEED_FOLDER_ID = "seed:my-notes";
const SEED_WELCOME_ID = "seed:welcome";

const DEFAULT_WELCOME_MARKDOWN = `# Welcome to LocalMark Studio

LocalMark Studio is a **local-first** Markdown editor designed for speed and privacy.

## What’s special here?
- **Local-first storage**: your notes live in your browser (IndexedDB).
- **Real file tree**: create folders + files, rename, delete.
- **Command palette**: press **⌘⇧P** (Mac) / **Ctrl⇧P** (Windows/Linux).
- **Smart paste**: paste rich HTML and get clean Markdown.
- **Live preview**: split-pane preview with scroll sync.
- **Extras**: optional Mermaid diagrams + KaTeX math.

## Quick start
1. Open the file tree and create a new file.
2. Write Markdown here.
3. Toggle preview/themes/Markdown features from the command palette.

## Export
You can export the active document as **Markdown**, **HTML**, **PDF**, or **JSON metadata**.

---

Happy writing!
`;

class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("parentId", "parentId", { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
    });
  }

  async getAllFiles(): Promise<FileNode[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveFile(file: FileNode): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(file);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async renameFile(id: string, newName: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const file = request.result as FileNode;
        if (file) {
          file.name = newName;
          file.updatedAt = Date.now();
          store.put(file).onsuccess = () => resolve();
        } else {
          reject(new Error("File not found"));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Helper to seed initial data if empty
  async seedIfEmpty(): Promise<void> {
    const files = await this.getAllFiles();
    if (files.length !== 0) return;

    const now = Date.now();

    // Use stable IDs so this seeding is safe even if invoked twice (e.g. React Strict Mode).
    await this.saveFile({
      id: SEED_FOLDER_ID,
      name: "My Notes",
      type: "folder",
      parentId: null,
      content: "",
      createdAt: now,
      updatedAt: now,
    });

    await this.saveFile({
      id: SEED_WELCOME_ID,
      name: "Welcome.md",
      type: "file",
      parentId: SEED_FOLDER_ID,
      tags: ["guide", "intro"],
      metadata: { Author: "LocalMark", Status: "Seeded" },
      content: DEFAULT_WELCOME_MARKDOWN,
      createdAt: now,
      updatedAt: now,
      isOpen: true,
    });
  }
}

export const dbService = new StorageService();
