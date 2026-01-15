import { FileNode, MarkdownFeatures, PreviewTheme } from "../types";
import { themeService } from "./themeService";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

export const exportService = {
  /**
   * Helper to trigger a browser download
   */
  downloadFile(filename: string, content: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
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
    const filename = file.name.endsWith(".md") ? file.name : `${file.name}.md`;
    this.downloadFile(filename, file.content, "text/markdown");
  },

  /**
   * Export as JSON metadata (.json)
   */
  exportJSON(file: FileNode) {
    const filename = file.name.replace(/\.[^/.]+$/, "") + ".json";
    const content = JSON.stringify(file, null, 2);
    this.downloadFile(filename, content, "application/json");
  },

  /**
   * Get the styled HTML string for HTML export or PDF printing
   */
  getStyledHTML(
    content: string,
    title: string,
    theme: PreviewTheme,
    features?: Pick<MarkdownFeatures, "math">
  ): string {
    // Use the same markdown pipeline style as the preview (GFM + optional math)
    // so features like footnotes render as in-document anchors (e.g. #fn-1)
    // instead of being misinterpreted as link reference definitions.
    const processor = unified().use(remarkParse).use(remarkGfm);
    if (features?.math) processor.use(remarkMath);
    processor.use(remarkRehype);
    if (features?.math) processor.use(rehypeKatex);
    processor.use(rehypeStringify);

    const rawHtml = processor.processSync(content).toString();

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
  exportHTML(
    file: FileNode,
    theme: PreviewTheme = "github",
    features?: Pick<MarkdownFeatures, "math">
  ) {
    const filename = file.name.replace(/\.[^/.]+$/, "") + ".html";
    const htmlContent = this.getStyledHTML(
      file.content,
      file.name,
      theme,
      features
    );
    this.downloadFile(filename, htmlContent, "text/html");
  },

  /**
   * Export as PDF (triggers Browser Print Dialog)
   */
  exportPDF(
    file: FileNode,
    theme: PreviewTheme = "github",
    features?: Pick<MarkdownFeatures, "math">
  ) {
    const htmlContent = this.getStyledHTML(
      file.content,
      file.name,
      theme,
      features
    );

    // Open a new window, write content, and print
    const printWindow = window.open("", "_blank");
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
  },
};
