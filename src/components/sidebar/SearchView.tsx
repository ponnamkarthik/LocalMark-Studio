import React, { useEffect, useState } from 'react';
import { ChevronRight, FileText, Hash, Replace, ReplaceAll } from 'lucide-react';
import { useApp } from '../../AppContext';

interface SearchMatch {
  fileId: string;
  fileName: string;
  line: number;
  col: number;
  context: string;
  fullMatch: string;
  index: number;
  isTag?: boolean;
}

const SearchView: React.FC = () => {
  const { files, updateFileContent, setActiveFile, setPendingScroll } = useApp();
  const [query, setQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delaySearch = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query, isRegex, isCaseSensitive, files]);

  const performSearch = () => {
    let matches: SearchMatch[] = [];

    if (query.startsWith('#') && query.length > 1) {
      const tagQuery = query.substring(1).toLowerCase();
      files
        .filter(f => f.type === 'file')
        .forEach(file => {
          const fileTags = file.tags || [];
          const matchedTags = fileTags.filter(t => t.toLowerCase().includes(tagQuery));

          if (matchedTags.length > 0) {
            matches.push({
              fileId: file.id,
              fileName: file.name,
              line: 0,
              col: 0,
              context: `Matched Tags: ${matchedTags.join(', ')}`,
              fullMatch: matchedTags[0],
              index: 0,
              isTag: true
            });
          }
        });
      setResults(matches);
      return;
    }

    let regex: RegExp;

    try {
      const flags = isCaseSensitive ? 'gm' : 'gim';
      regex = isRegex ? new RegExp(query, flags) : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    } catch {
      return;
    }

    files
      .filter(f => f.type === 'file')
      .forEach(file => {
        const content = file.content;
        let match;

        regex.lastIndex = 0;

        while ((match = regex.exec(content)) !== null) {
          if (match[0].length === 0) {
            regex.lastIndex++;
            continue;
          }

          const index = match.index;
          const textBeforeMatch = content.substring(0, index);
          const line = textBeforeMatch.split('\n').length;
          const lineStartIdx = textBeforeMatch.lastIndexOf('\n') + 1;
          const col = index - lineStartIdx + 1;

          const lineEndIdx = content.indexOf('\n', index);
          const contextEnd = lineEndIdx === -1 ? content.length : lineEndIdx;
          const context = content.substring(lineStartIdx, contextEnd);

          matches.push({
            fileId: file.id,
            fileName: file.name,
            line,
            col,
            context,
            fullMatch: match[0],
            index
          });
        }
      });
    setResults(matches);
  };

  const handleReplace = async (match: SearchMatch) => {
    if (match.isTag) return;
    const file = files.find(f => f.id === match.fileId);
    if (!file) return;

    const currentMatch = file.content.substring(match.index, match.index + match.fullMatch.length);
    if (currentMatch !== match.fullMatch) {
      alert('File content has changed. Rescanning...');
      performSearch();
      return;
    }

    const before = file.content.substring(0, match.index);
    const after = file.content.substring(match.index + match.fullMatch.length);
    const newContent = before + replaceQuery + after;

    await updateFileContent(file.id, newContent);
  };

  const handleReplaceAll = async () => {
    if (!confirm(`Replace ${results.length} occurrences across ${new Set(results.map(r => r.fileId)).size} files?`)) return;

    const filesToUpdate = new Map<string, SearchMatch[]>();
    results
      .filter(r => !r.isTag)
      .forEach(r => {
        if (!filesToUpdate.has(r.fileId)) filesToUpdate.set(r.fileId, []);
        filesToUpdate.get(r.fileId)!.push(r);
      });

    for (const [fileId] of filesToUpdate) {
      const file = files.find(f => f.id === fileId);
      if (file) {
        let content = file.content;
        let regex: RegExp;
        try {
          const flags = isCaseSensitive ? 'gm' : 'gim';
          regex = isRegex ? new RegExp(query, flags) : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
          content = content.replace(regex, replaceQuery);
          await updateFileContent(fileId, content);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const navigateToMatch = (match: SearchMatch) => {
    setActiveFile(match.fileId);
    if (!match.isTag) {
      setPendingScroll({ line: match.line, column: match.col });
    }
  };

  const groupedResults = results.reduce(
    (acc, match) => {
      if (!acc[match.fileId]) acc[match.fileId] = [];
      acc[match.fileId].push(match);
      return acc;
    },
    {} as Record<string, SearchMatch[]>
  );

  return (
    <div className="flex flex-col h-full bg-theme-sidebar">
      <div className="p-3 border-b border-theme-border shrink-0 space-y-2">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search or #tag"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-theme-activity text-sm text-white px-2 py-1.5 pr-14 rounded border border-theme-border focus:border-theme-accent outline-none"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
            <button
              onClick={() => setIsCaseSensitive(!isCaseSensitive)}
              className={`p-0.5 rounded ${isCaseSensitive ? 'bg-theme-accent/20 text-theme-accent' : 'text-theme-text-muted hover:text-white'}`}
              title="Match Case"
            >
              <span className="text-[10px] font-bold px-1">Aa</span>
            </button>
            <button
              onClick={() => setIsRegex(!isRegex)}
              className={`p-0.5 rounded ${isRegex ? 'bg-theme-accent/20 text-theme-accent' : 'text-theme-text-muted hover:text-white'}`}
              title="Use Regular Expression"
            >
              <span className="text-[10px] font-bold px-1">.*</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-theme-text-muted hover:text-white transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          >
            <ChevronRight size={14} />
          </button>
          <div className="flex-1 relative">
            {isExpanded && (
              <div className="animate-in slide-in-from-top-1 duration-200">
                <input
                  type="text"
                  placeholder="Replace"
                  value={replaceQuery}
                  onChange={e => setReplaceQuery(e.target.value)}
                  className="w-full bg-theme-activity text-sm text-white px-2 py-1.5 pr-8 rounded border border-theme-border focus:border-theme-accent outline-none mb-2"
                />
                <button
                  onClick={handleReplaceAll}
                  disabled={results.length === 0}
                  className="p-1 absolute right-1 top-1.5 text-theme-text-muted hover:text-white disabled:opacity-30"
                  title="Replace All"
                >
                  <ReplaceAll size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {results.length === 0 && query && <div className="p-4 text-center text-xs text-theme-text-muted">No results found</div>}
        {Object.entries(groupedResults).map(([fileId, matches]) => {
          return (
            <div key={fileId} className="flex flex-col">
              <div className="px-3 py-1 bg-theme-activity/50 flex items-center gap-2 sticky top-0 z-10">
                <FileText size={12} className="text-theme-text-muted" />
                <span className="text-xs font-bold text-theme-text-main truncate flex-1">{matches[0].fileName}</span>
                <span className="text-[10px] bg-theme-hover px-1.5 rounded-full text-theme-text-muted">{matches.length}</span>
              </div>
              <div>
                {matches.map((match, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-2 px-6 py-1 hover:bg-theme-hover cursor-pointer border-l-2 border-transparent hover:border-theme-text-muted"
                    onClick={() => navigateToMatch(match)}
                  >
                    {!match.isTag && (
                      <span className="text-[10px] text-theme-text-dim font-mono mt-0.5 w-6 text-right shrink-0">{match.line}</span>
                    )}
                    {match.isTag && (
                      <span className="text-[10px] text-theme-accent font-mono mt-0.5 w-6 text-right shrink-0">
                        <Hash size={10} />
                      </span>
                    )}
                    <div className="flex-1 min-w-0 overflow-hidden text-xs text-theme-text-muted">
                      <span className="whitespace-pre font-mono truncate block">{match.context}</span>
                    </div>
                    {isExpanded && !match.isTag && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleReplace(match);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-theme-activity rounded text-theme-text-muted hover:text-white"
                        title="Replace this match"
                      >
                        <Replace size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchView;

