import { editor, MarkerSeverity } from 'monaco-editor';

export const lintMarkdown = (model: editor.ITextModel): editor.IMarkerData[] => {
    const markers: editor.IMarkerData[] = [];
    const content = model.getValue();
    const lines = content.split('\n');

    // 1. Check for unclosed code blocks
    const codeBlockFences = content.match(/^```/gm);
    if (codeBlockFences && codeBlockFences.length % 2 !== 0) {
        const lastIndex = content.lastIndexOf('```');
        const pos = model.getPositionAt(lastIndex);
        markers.push({
            startLineNumber: pos.lineNumber,
            startColumn: 1,
            endLineNumber: pos.lineNumber,
            endColumn: 4,
            message: "Unclosed code block. This may break formatting for the rest of the document.",
            severity: MarkerSeverity.Error
        });
    }

    // 2. Check for headers without space (e.g. #Header instead of # Header)
    lines.forEach((line, idx) => {
        const match = line.match(/^(#+)([^ #])/);
        if (match) {
            markers.push({
                startLineNumber: idx + 1,
                startColumn: 1,
                endLineNumber: idx + 1,
                endColumn: match[1].length + 1,
                message: "Markdown headers require a space after the hash (e.g., '# Header').",
                severity: MarkerSeverity.Warning
            });
        }
    });

    // 3. Check for malformed tables
    let inTable = false;
    let expectedPipes = 0;
    
    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('|')) {
            const pipes = (trimmed.match(/\|/g) || []).length;
            
            if (!inTable) {
                // Potential start of table
                inTable = true;
                expectedPipes = pipes;
            } else {
                // Continuation
                if (Math.abs(pipes - expectedPipes) > 1) { // Allow slightly malformed, but warn if drastic
                     markers.push({
                        startLineNumber: idx + 1,
                        startColumn: 1,
                        endLineNumber: idx + 1,
                        endColumn: line.length + 1,
                        message: `Row has ${pipes} pipes, but header had ${expectedPipes}. Table rendering may break.`,
                        severity: MarkerSeverity.Warning
                    });
                }
            }
        } else if (inTable && trimmed === '') {
            inTable = false;
        }
    });

    // 4. Link Validation
    const definedRefs = new Set<string>();
    const usedRefs: { id: string, line: number, col: number, endCol: number }[] = [];

    lines.forEach((line, idx) => {
        const lineNumber = idx + 1;

        // A. Definitions: [id]: url
        const defMatch = line.match(/^\[([^\]]+)\]:\s+/);
        if (defMatch) {
            definedRefs.add(defMatch[1].toLowerCase());
        }

        // B. Inline Link Issues
        // Unclosed link [text](...
        const openLink = /\[([^\]]+)\]\(([^)]*)$/; 
        if (openLink.test(line)) {
            markers.push({
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
                message: "Unclosed link. Missing closing parenthesis.",
                severity: MarkerSeverity.Error
            });
        }
        
        // Empty link [text]()
        const emptyLink = /\[([^\]]+)\]\(\)/;
        if (emptyLink.test(line)) {
             markers.push({
                startLineNumber: lineNumber,
                startColumn: line.indexOf('()') + 1,
                endLineNumber: lineNumber,
                endColumn: line.indexOf('()') + 3,
                message: "Empty link URL.",
                severity: MarkerSeverity.Info
            });
        }

        // C. Collect Reference Usages: [text][id] or [id][]
        // Regex global to find multiple per line
        const refRegex = /\[([^\]]+)\]\[([^\]]*)\]/g;
        let match;
        while ((match = refRegex.exec(line)) !== null) {
            const fullMatch = match[0];
            const text = match[1];
            const refId = match[2] || text; // If [id][], refId is empty, so use text
            
            usedRefs.push({
                id: refId.toLowerCase(),
                line: lineNumber,
                col: match.index + 1,
                endCol: match.index + 1 + fullMatch.length
            });
        }
    });

    // 5. Cross-reference validation
    usedRefs.forEach(ref => {
        if (!definedRefs.has(ref.id)) {
            markers.push({
                startLineNumber: ref.line,
                startColumn: ref.col,
                endLineNumber: ref.line,
                endColumn: ref.endCol,
                message: `Broken reference link. Definition for '[${ref.id}]' not found.`,
                severity: MarkerSeverity.Warning
            });
        }
    });

    return markers;
};