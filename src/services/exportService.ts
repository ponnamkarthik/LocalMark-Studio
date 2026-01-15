import { marked } from 'marked';
import { FileNode, PreviewTheme } from '../types';
import { themeService } from './themeService';

export const exportService = {
  /**
   * Helper to trigger a browser download
   */
  downloadFile(filename: string, content: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export as raw Markdown file (.md)
   */
  exportMarkdown(file: FileNode) {
    const filename = file.name.endsWith('.md') ? file.name : `${file.name}.md`;
    this.downloadFile(filename, file.content, 'text/markdown');
  },

  /**
   * Export as JSON metadata (.json)
   */
  exportJSON(file: FileNode) {
    const filename = file.name.replace(/\.[^/.]+$/, "") + ".json";
    const content = JSON.stringify(file, null, 2);
    this.downloadFile(filename, content, 'application/json');
  },

  /**
   * Get the styled HTML string for HTML export or PDF printing
   */
  getStyledHTML(content: string, title: string, theme: PreviewTheme): string {
    const rawHtml = marked.parse(content) as string;
    
    // Get CSS from central service, forcing export mode (Light Mode defaults usually)
    const css = themeService.getThemeCSS(theme, true);

    const styles = `
      <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        @media print {
            .container { max-width: 100%; padding: 0; }
        }
        ${css}
      </style>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        ${styles}
      </head>
      <body>
        <div class="container">
            <div class="markdown-body">
                ${rawHtml}
            </div>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Export as Styled HTML file (.html)
   */
  exportHTML(file: FileNode, theme: PreviewTheme = 'github') {
    const filename = file.name.replace(/\.[^/.]+$/, "") + ".html";
    const htmlContent = this.getStyledHTML(file.content, file.name, theme);
    this.downloadFile(filename, htmlContent, 'text/html');
  },

  /**
   * Export as PDF (triggers Browser Print Dialog)
   */
  exportPDF(file: FileNode, theme: PreviewTheme = 'github') {
    const htmlContent = this.getStyledHTML(file.content, file.name, theme);
    
    // Open a new window, write content, and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for resources to load (e.g. if we had images) then print
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    } else {
        alert("Please allow popups to export as PDF.");
    }
  }
};