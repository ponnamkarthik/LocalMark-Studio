import React, { useState } from "react";
import LegalModal from "./LegalModal";
import { Files, Search } from "lucide-react";
import ExplorerView from "./sidebar/ExplorerView";
import SearchView from "./sidebar/SearchView";

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"explorer" | "search">("explorer");
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  return (
    <>
      <div className="w-64 bg-theme-sidebar border-r border-theme-border flex flex-col h-full select-none">
        {/* Sidebar Tabs */}
        <div className="flex border-b border-theme-border bg-theme-header shrink-0">
          <button
            onClick={() => setActiveTab("explorer")}
            className={`flex-1 flex items-center justify-center py-2.5 transition-colors border-b-2 ${
              activeTab === "explorer"
                ? "border-theme-accent text-theme-text-main"
                : "border-transparent text-theme-text-muted hover:text-theme-text-main"
            }`}
            title="Explorer"
          >
            <Files size={18} />
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 flex items-center justify-center py-2.5 transition-colors border-b-2 ${
              activeTab === "search"
                ? "border-theme-accent text-theme-text-main"
                : "border-transparent text-theme-text-muted hover:text-theme-text-main"
            }`}
            title="Search"
          >
            <Search size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === "explorer" ? <ExplorerView /> : <SearchView />}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-theme-border bg-theme-bg shrink-0">
          <div className="flex flex-col gap-1.5 items-center text-[10px] text-theme-text-dim">
            <div className="flex gap-3">
              <a
                href="/privacy"
                target="_blank"
                rel="noreferrer"
                className="hover:text-theme-text-muted hover:underline transition-colors"
              >
                Privacy Policy
              </a>
              <span>•</span>
              <a
                href="/terms"
                target="_blank"
                rel="noreferrer"
                className="hover:text-theme-text-muted hover:underline transition-colors"
              >
                Terms
              </a>
              <span>•</span>
              <button
                onClick={() => setIsLegalOpen(true)}
                className="hover:text-theme-text-muted hover:underline transition-colors"
              >
                View in-app
              </button>
            </div>
          </div>
        </div>
      </div>

      <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
    </>
  );
};

export default Sidebar;
