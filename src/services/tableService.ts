import { editor, Position, Range } from 'monaco-editor';

export interface TableLocation {
    isInTable: boolean;
    rowIndex: number;
    colIndex: number;
    totalRows: number;
    totalCols: number;
}

interface TableBounds {
    startLine: number;
    endLine: number;
    lines: string[];
}

/**
 * Determine which visual column index (0-based) the cursor is in
 */
const getColumnIndex = (line: string, column: number): number => {
    // Slice line up to cursor
    const beforeCursor = line.substring(0, column);
    // Count pipes to determine column
    const pipes = (beforeCursor.match(/\|/g) || []).length;
    // If text starts with pipe, col 1 is index 0 (1 pipe seen)
    // | col 0 | col 1 |
    return Math.max(0, pipes - 1);
};

/**
 * Parse lines into a grid of cells
 */
const parseTable = (lines: string[]) => {
    return lines.map(line => {
        const row = line.trim();
        const cells = row.split('|');
        if (row.startsWith('|')) cells.shift();
        if (row.endsWith('|')) cells.pop();
        return cells.map(c => c.trim());
    });
};

/**
 * Formats a 2D grid back into a Markdown table string with aligned columns
 */
const formatGrid = (grid: string[][]): string => {
    if (grid.length === 0) return '';

    // Calculate max width per column
    const colWidths: number[] = [];
    grid.forEach(row => {
        row.forEach((cell, i) => {
            colWidths[i] = Math.max(colWidths[i] || 3, cell.length); // Min width 3 for '---'
        });
    });

    return grid.map((row, rowIdx) => {
        return '| ' + row.map((cell, colIdx) => {
            const width = colWidths[colIdx] || 0;
            // Handle separator row specifically (usually index 1)
            if (rowIdx === 1 && cell.match(/^-+$/)) {
                return '-'.repeat(width);
            }
            return cell.padEnd(width, ' ');
        }).join(' | ') + ' |';
    }).join('\n');
};

/**
 * Detects if the cursor is currently inside a Markdown table
 */
export const isCursorInTable = (model: editor.ITextModel, position: Position): boolean => {
    const lineContent = model.getLineContent(position.lineNumber);
    // Basic check: starts with | or contains | separators inside structure
    return /^\s*\|/.test(lineContent) || (/\|/.test(lineContent) && lineContent.trim().length > 3);
};

/**
 * Finds the full range of the table surrounding the current line
 */
export const getTableBounds = (model: editor.ITextModel, lineNumber: number): TableBounds | null => {
    const lineCount = model.getLineCount();
    let start = lineNumber;
    let end = lineNumber;

    // Search up
    while (start > 1) {
        const prevContent = model.getLineContent(start - 1).trim();
        if (!prevContent.startsWith('|') && !prevContent.includes('|')) break;
        start--;
    }

    // Search down
    while (end < lineCount) {
        const nextContent = model.getLineContent(end + 1).trim();
        if (!nextContent.startsWith('|') && !nextContent.includes('|')) break;
        end++;
    }

    const lines = [];
    for (let i = start; i <= end; i++) {
        lines.push(model.getLineContent(i));
    }

    // Validation: Needs at least 2 lines to be a real table (header + separator)
    if (lines.length < 2) return null;

    return { startLine: start, endLine: end, lines };
};

/**
 * Helper to get the content range of a specific cell in a specific line
 */
const getCellRange = (model: editor.ITextModel, lineNumber: number, cellIndex: number): Range | null => {
    const lineContent = model.getLineContent(lineNumber);
    let pipeIndices: number[] = [];
    
    // Find all pipe locations
    for (let i = 0; i < lineContent.length; i++) {
        if (lineContent[i] === '|') pipeIndices.push(i);
    }
    
    // Assuming table starts with pipe.
    if (pipeIndices.length < 2) return null;

    const startsWithPipe = /^\s*\|/.test(lineContent);
    const effectiveIndex = startsWithPipe ? cellIndex : cellIndex - 1;

    let p1: number; // Index of left pipe
    let p2: number; // Index of right pipe

    if (effectiveIndex < 0) {
        // Special case: Table line missing leading pipe (e.g. " content |")
        // Treat start of line as boundary
        p1 = -1;
        p2 = pipeIndices[0];
    } else {
        if (effectiveIndex >= pipeIndices.length - 1) return null; // Out of bounds
        p1 = pipeIndices[effectiveIndex];
        p2 = pipeIndices[effectiveIndex + 1];
    }

    // Monaco Columns (1-based)
    // p1 is index of start pipe. Content starts at index p1 + 1. Column is p1 + 2.
    // p2 is index of end pipe. Content ends at index p2 (exclusive). Column is p2 + 1 (Monaco exclusive end).
    const contentStartCol = p1 + 2;
    const contentEndCol = p2 + 1;

    // Safety check
    if (contentStartCol > contentEndCol) return null;

    // Get the exact content string to check for whitespace
    // Substring indices are 0-based.
    // Start index: p1 + 1
    // End index: p2
    const rawContent = lineContent.substring(p1 + 1, p2);

    if (!rawContent.trim()) {
        // Empty or whitespace only -> Select everything so typing replaces the whitespace
        return new Range(lineNumber, contentStartCol, lineNumber, contentEndCol);
    }

    // Calculate trim offsets to select only the text
    const leadingSpaces = rawContent.search(/\S|$/);
    const trailingMatch = rawContent.match(/\s*$/);
    const trailingSpaces = trailingMatch ? trailingMatch[0].length : 0;

    return new Range(
        lineNumber, 
        contentStartCol + leadingSpaces,
        lineNumber, 
        contentEndCol - trailingSpaces
    );
};

export const formatTableAtCursor = (model: editor.ITextModel, position: Position) => {
    const bounds = getTableBounds(model, position.lineNumber);
    if (!bounds) return;

    const grid = parseTable(bounds.lines);
    const newText = formatGrid(grid);

    return {
        range: new Range(bounds.startLine, 1, bounds.endLine, model.getLineMaxColumn(bounds.endLine)),
        text: newText
    };
};

export const insertRow = (model: editor.ITextModel, position: Position, direction: 'above' | 'below') => {
    const bounds = getTableBounds(model, position.lineNumber);
    if (!bounds) return;

    const grid = parseTable(bounds.lines);
    if (grid.length === 0) return;

    // Use header row to determine column count
    const colCount = grid[0].length;
    const newRow = Array(colCount).fill('   ');

    // Calculate insertion index relative to grid
    const currentRowIdx = position.lineNumber - bounds.startLine;
    const insertIdx = direction === 'above' ? currentRowIdx : currentRowIdx + 1;

    grid.splice(insertIdx, 0, newRow);
    const newText = formatGrid(grid);

    return {
        range: new Range(bounds.startLine, 1, bounds.endLine, model.getLineMaxColumn(bounds.endLine)),
        text: newText
    };
};

export const deleteRow = (model: editor.ITextModel, position: Position) => {
    const bounds = getTableBounds(model, position.lineNumber);
    if (!bounds) return;

    const grid = parseTable(bounds.lines);
    const rowIdx = position.lineNumber - bounds.startLine;

    // Don't delete header or separator
    if (rowIdx <= 1 && grid.length <= 2) return; 

    grid.splice(rowIdx, 1);
    const newText = formatGrid(grid);

    return {
        range: new Range(bounds.startLine, 1, bounds.endLine, model.getLineMaxColumn(bounds.endLine)),
        text: newText
    };
};

export const insertColumn = (model: editor.ITextModel, position: Position, direction: 'left' | 'right') => {
    const bounds = getTableBounds(model, position.lineNumber);
    if (!bounds) return;

    const lineContent = model.getLineContent(position.lineNumber);
    const colIdx = getColumnIndex(lineContent, position.column);

    const grid = parseTable(bounds.lines);
    
    const targetIdx = direction === 'left' ? colIdx : colIdx + 1;
    
    grid.forEach((row, i) => {
        const fill = (i === 1 && row[0].match(/^-+$/)) ? '---' : '   ';
        row.splice(targetIdx, 0, fill);
    });

    const newText = formatGrid(grid);
    return {
        range: new Range(bounds.startLine, 1, bounds.endLine, model.getLineMaxColumn(bounds.endLine)),
        text: newText
    };
};

export const deleteColumn = (model: editor.ITextModel, position: Position) => {
    const bounds = getTableBounds(model, position.lineNumber);
    if (!bounds) return;

    const lineContent = model.getLineContent(position.lineNumber);
    const colIdx = getColumnIndex(lineContent, position.column);
    const grid = parseTable(bounds.lines);

    if (grid[0].length <= 1) return; // Don't delete last column

    grid.forEach(row => {
        row.splice(colIdx, 1);
    });

    const newText = formatGrid(grid);
    return {
        range: new Range(bounds.startLine, 1, bounds.endLine, model.getLineMaxColumn(bounds.endLine)),
        text: newText
    };
};

export const getTableCellLocation = (model: editor.ITextModel, position: Position): TableLocation => {
    const notInTable = { isInTable: false, rowIndex: 0, colIndex: 0, totalRows: 0, totalCols: 0 };
    
    if (!isCursorInTable(model, position)) return notInTable;

    const bounds = getTableBounds(model, position.lineNumber);
    if (!bounds) return notInTable;

    const grid = parseTable(bounds.lines);
    if (grid.length === 0) return notInTable;

    const rowIndex = position.lineNumber - bounds.startLine + 1;
    const lineContent = model.getLineContent(position.lineNumber);
    const colIndex = getColumnIndex(lineContent, position.column) + 1;

    return {
        isInTable: true,
        rowIndex,
        colIndex,
        totalRows: grid.length,
        totalCols: grid[0]?.length || 0
    };
};

export const createTable = (rows: number, cols: number): string => {
    // Generate a symmetric, aligned table string
    const cellWidth = 8;
    const headerContent = " Header ";
    const separatorContent = "-".repeat(cellWidth);
    const bodyContent = " ".repeat(cellWidth);

    const buildRow = (content: string) => "|" + Array(cols).fill(content).join("|") + "|";
    
    const header = buildRow(headerContent);
    const separator = buildRow(separatorContent);
    
    const bodyRowsArray = [];
    for(let i=0; i<rows; i++) {
        bodyRowsArray.push(buildRow(bodyContent));
    }
    
    return `${header}\n${separator}\n${bodyRowsArray.join('\n')}`;
};

/**
 * Navigate to next/prev cell
 */
export const navigateTable = (model: editor.ITextModel, position: Position, direction: 'next' | 'prev'): Range | null => {
    const bounds = getTableBounds(model, position.lineNumber);
    if (!bounds) return null;

    const grid = parseTable(bounds.lines);
    if (grid.length === 0) return null;

    const lineContent = model.getLineContent(position.lineNumber);
    const colCount = grid[0].length;
    
    let currentRowIdx = position.lineNumber - bounds.startLine; // 0-based relative to table
    let currentColIdx = getColumnIndex(lineContent, position.column);

    // Calculate target
    if (direction === 'next') {
        currentColIdx++;
        if (currentColIdx >= colCount) {
            currentColIdx = 0;
            currentRowIdx++;
        }
    } else {
        currentColIdx--;
        if (currentColIdx < 0) {
            currentColIdx = colCount - 1;
            currentRowIdx--;
        }
    }

    // Wrap around vertical bounds or stop?
    // Standard UX: Stop at end/start of table
    if (currentRowIdx < 0 || currentRowIdx >= grid.length) return null;

    // Skip separator row (usually index 1)
    const targetLineContent = bounds.lines[currentRowIdx];
    if (targetLineContent.trim().match(/^\|?(\s*:?-+:?\s*\|)+\s*$/)) {
         if (direction === 'next') currentRowIdx++;
         else currentRowIdx--;
         
         // Check bounds again after skip
         if (currentRowIdx < 0 || currentRowIdx >= grid.length) return null;
    }

    const absoluteLineNumber = bounds.startLine + currentRowIdx;
    
    // Get the range of the content inside that cell
    return getCellRange(model, absoluteLineNumber, currentColIdx);
};