import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import { useApp } from '../AppContext';
import { themeService } from '../services/themeService';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Info, AlertTriangle, XCircle, Lightbulb, Footprints, Network, Sigma, MessageSquareQuote, ChevronDown } from 'lucide-react';
import { PreviewTheme } from '../types';

interface PreviewAreaProps {
    onScroll?: React.UIEventHandler<HTMLDivElement>;
}

// Mermaid Renderer Component
const MermaidDiagram = ({ definition }: { definition: string }) => {
    const [svg, setSvg] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const renderDiagram = async () => {
            try {
                mermaid.initialize({ 
                    startOnLoad: false, 
                    theme: 'dark',
                    securityLevel: 'loose'
                });
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, definition);
                setSvg(svg);
            } catch (error) {
                console.error('Mermaid render error:', error);
                setSvg(`<div style="color: #ef4444; font-size: 0.8em; padding: 1rem; border: 1px dashed #ef4444; border-radius: 0.5rem;">Failed to render Diagram. Check syntax.</div>`);
            }
        };

        if (definition) renderDiagram();
    }, [definition]);

    return (
        <div 
            ref={containerRef}
            className="flex justify-center my-4 p-4 bg-theme-activity/30 rounded-lg overflow-x-auto" 
            dangerouslySetInnerHTML={{ __html: svg }} 
        />
    );
};

// Custom Blockquote for Callouts
const CustomBlockquote = ({ children }: { children: React.ReactNode }) => {
    const childrenArray = React.Children.toArray(children);

    const extractText = (node: React.ReactNode): string => {
        if (typeof node === 'string') return node;
        if (React.isValidElement(node)) {
            const props = node.props as { children?: React.ReactNode };
            if (props.children) {
                return React.Children.map(props.children, extractText)?.join('') || '';
            }
        }
        return '';
    };

    const isParagraphElement = (node: React.ReactNode): node is React.ReactElement => {
        return React.isValidElement(node) && typeof node.type === 'string' && node.type === 'p';
    };

    const calloutMarkerRegex = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i;
    const calloutMarkerStripRegex = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;

    const firstParagraphIndex = childrenArray.findIndex(isParagraphElement);
    const firstParagraph = firstParagraphIndex >= 0 ? (childrenArray[firstParagraphIndex] as React.ReactElement) : null;

    if (firstParagraph) {
        const rawText = extractText(firstParagraph);
        const match = rawText.match(calloutMarkerRegex);

        if (match) {
            const type = match[1].toUpperCase();
            
            let colorClass = 'border-blue-500 bg-blue-500/10 text-blue-200';
            let Icon = Info;
            let title = 'Note';

            switch (type) {
                case 'TIP':
                    colorClass = 'border-green-500 bg-green-500/10 text-green-200';
                    Icon = Lightbulb;
                    title = 'Tip';
                    break;
                case 'IMPORTANT':
                    colorClass = 'border-purple-500 bg-purple-500/10 text-purple-200';
                    Icon = AlertTriangle;
                    title = 'Important';
                    break;
                case 'WARNING':
                    colorClass = 'border-yellow-500 bg-yellow-500/10 text-yellow-200';
                    Icon = AlertTriangle;
                    title = 'Warning';
                    break;
                case 'CAUTION':
                    colorClass = 'border-red-500 bg-red-500/10 text-red-200';
                    Icon = XCircle;
                    title = 'Caution';
                    break;
            }

            const stripMarkerOnce = (
                node: React.ReactNode
            ): { nextNode: React.ReactNode; didStrip: boolean } => {
                if (Array.isArray(node)) {
                    let didStrip = false;
                    const nextArray = node.map(child => {
                        if (didStrip) return child;
                        const res = stripMarkerOnce(child);
                        didStrip = res.didStrip;
                        return res.nextNode;
                    });
                    return { nextNode: nextArray, didStrip };
                }

                if (typeof node === 'string') {
                    if (calloutMarkerStripRegex.test(node)) {
                        return { nextNode: node.replace(calloutMarkerStripRegex, ''), didStrip: true };
                    }
                    return { nextNode: node, didStrip: false };
                }

                if (!React.isValidElement(node)) return { nextNode: node, didStrip: false };

                const props = node.props as { children?: React.ReactNode };
                if (!props.children) return { nextNode: node, didStrip: false };

                let didStrip = false;
                const nextChildren = React.Children.map(props.children, child => {
                    if (didStrip) return child;
                    const res = stripMarkerOnce(child);
                    didStrip = res.didStrip;
                    return res.nextNode;
                });

                if (!didStrip) return { nextNode: node, didStrip: false };

                return {
                    nextNode: React.cloneElement(node as React.ReactElement<any>, {
                        ...(node.props as object),
                        children: nextChildren
                    }),
                    didStrip: true
                };
            };

            const filteredChildren = childrenArray
                .map((child, index) => {
                    if (index !== firstParagraphIndex) return child;
                    if (!isParagraphElement(child)) return child;

                    const props = child.props as { children?: React.ReactNode };
                    const res = stripMarkerOnce(props.children);

                    const nextParagraph = React.cloneElement(child as React.ReactElement<any>, {
                        ...(child.props as object),
                        children: res.nextNode
                    });

                    if (extractText(nextParagraph).trim().length === 0) return null;
                    return nextParagraph;
                })
                .filter(Boolean) as React.ReactNode[];

            return (
                <div className={`my-4 border-l-4 rounded-r-md p-4 ${colorClass}`}>
                    <div className="flex items-center gap-2 font-bold mb-2 select-none opacity-90">
                        <Icon size={18} />
                        <span>{title}</span>
                    </div>
                    <div className="opacity-90">
                        {filteredChildren}
                    </div>
                </div>
            );
        }
    }

    return <blockquote>{children}</blockquote>;
};

// Feature Toggle Button Component
const FeatureToggle = ({ 
    label, 
    isActive, 
    onClick, 
    icon: Icon,
    activeColorClass,
    inactiveColorClass 
}: { 
    label: string, 
    isActive: boolean, 
    onClick: () => void, 
    icon: any,
    activeColorClass: string,
    inactiveColorClass?: string
}) => (
    <button 
        onClick={onClick}
        className={`
            flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium border transition-all select-none whitespace-nowrap
            ${isActive 
                ? activeColorClass 
                : (inactiveColorClass || 'bg-transparent text-theme-text-dim border-transparent hover:text-theme-text-muted hover:bg-theme-activity')
            }
        `}
        title={`Toggle ${label} Support`}
    >
        <Icon size={12} />
        <span>{label}</span>
    </button>
);


const PreviewArea = React.forwardRef<HTMLDivElement, PreviewAreaProps>(({ onScroll }, ref) => {
  const { files, activeFileId, features, toggleFeature, previewTheme, setPreviewTheme } = useApp();
  const activeFile = files.find(f => f.id === activeFileId);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const internalPreviewRef = useRef<HTMLDivElement | null>(null);
  const setPreviewRef = useCallback(
    (node: HTMLDivElement | null) => {
      internalPreviewRef.current = node;

      if (typeof ref === 'function') ref(node);
      else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref]
  );

  const handlePreviewClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const anchor = target.closest('a') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const container = internalPreviewRef.current;
    if (!container) return;

    const rawId = href.slice(1);
    if (!rawId) return;

    const id = decodeURIComponent(rawId);
    const escapeCssId = (value: string) => value.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
    const el = container.querySelector<HTMLElement>(`#${escapeCssId(id)}`);
    if (!el) return;

    e.preventDefault();
    e.stopPropagation();

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const nextTop = elRect.top - containerRect.top + container.scrollTop;
    container.scrollTo({ top: Math.max(0, nextTop - 12), behavior: 'smooth' });
  }, []);

  // Dynamic Plugin Loading
  const remarkPlugins = useMemo(() => {
    const plugins: any[] = [remarkGfm];
    if (features.math) plugins.push(remarkMath as any);
    return plugins;
  }, [features]);

  const rehypePlugins = useMemo(() => {
      const plugins: any[] = [];
      if (features.math) plugins.push(rehypeKatex as any);
      return plugins;
  }, [features]);

  // Generate CSS based on theme
  const themeCSS = useMemo(() => themeService.getThemeCSS(previewTheme), [previewTheme]);

  if (!activeFile) return null;

  return (
    <div className="h-full w-full flex flex-col bg-theme-bg">
        <div className="h-[45px] flex items-center px-3 bg-theme-activity border-b border-theme-border select-none shrink-0 justify-between gap-3">
             {/* Left: Theme Selector */}
             <div className="relative shrink-0">
                <button 
                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                    className="flex items-center gap-1.5 text-xs font-bold text-theme-text-muted hover:text-theme-text-main transition-colors uppercase tracking-wider px-2 py-1 rounded hover:bg-theme-hover"
                >
                    <span className="hidden xl:inline opacity-50 font-normal normal-case tracking-normal">Preview:</span>
                    <span>{previewTheme}</span>
                    <ChevronDown size={12} strokeWidth={3} className="opacity-50" />
                </button>
                {showThemeMenu && (
                    <div className="absolute top-full left-0 mt-1 w-36 bg-theme-header border border-theme-border rounded shadow-lg py-1 z-20">
                         {(['github', 'notion', 'minimal'] as PreviewTheme[]).map(t => (
                             <button
                                key={t}
                                onClick={() => { setPreviewTheme(t); setShowThemeMenu(false); }}
                                className={`w-full text-left px-3 py-1.5 text-xs capitalize hover:bg-theme-hover ${previewTheme === t ? 'text-theme-accent font-bold' : 'text-theme-text-muted'}`}
                             >
                                {t}
                             </button>
                         ))}
                    </div>
                )}
                {/* Backdrop for menu */}
                {showThemeMenu && <div className="fixed inset-0 z-10" onClick={() => setShowThemeMenu(false)} />}
             </div>
             
             {/* Right: Feature Toggles */}
             <div className="flex-1 min-w-0 flex justify-end">
                 <div 
                    className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-fade"
                    style={{ scrollbarWidth: 'none' }} 
                 >
                     <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                     <FeatureToggle 
                        label="Mermaid" 
                        isActive={features.mermaid} 
                        onClick={() => toggleFeature('mermaid')} 
                        icon={Network}
                        activeColorClass="bg-pink-500/10 text-pink-400 border-pink-500/20"
                     />
                     <FeatureToggle 
                        label="Math" 
                        isActive={features.math} 
                        onClick={() => toggleFeature('math')} 
                        icon={Sigma}
                        activeColorClass="bg-blue-500/10 text-blue-400 border-blue-500/20"
                     />
                     <FeatureToggle 
                        label="Callouts" 
                        isActive={features.callouts} 
                        onClick={() => toggleFeature('callouts')} 
                        icon={MessageSquareQuote}
                        activeColorClass="bg-orange-500/10 text-orange-400 border-orange-500/20"
                     />
                     <FeatureToggle 
                        label="Footnotes" 
                        isActive={features.footnotes} 
                        onClick={() => toggleFeature('footnotes')} 
                        icon={Footprints}
                        activeColorClass="bg-purple-500/10 text-purple-400 border-purple-500/20"
                     />
                 </div>
             </div>
        </div>

        <div 
            ref={setPreviewRef}
            onScroll={onScroll}
            onClickCapture={handlePreviewClickCapture}
            className="flex-1 w-full p-4 markdown-body bg-theme-bg text-theme-text-main overflow-auto custom-scrollbar"
        >
            <style>{themeCSS}</style>
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={{
              ...(features.callouts ? { blockquote: CustomBlockquote } : {}),
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                
                if (!inline && language === 'mermaid' && features.mermaid) {
                    return <MermaidDiagram definition={String(children).replace(/\n$/, '')} />;
                }

                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={language}
                    PreTag="div"
                    {...props}
                    customStyle={{ background: 'var(--bg-activity)', border: '1px solid var(--border-color)' }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {activeFile.content}
          </ReactMarkdown>
        </div>
    </div>
  );
});

export default PreviewArea;
