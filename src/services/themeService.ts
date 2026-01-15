import { PreviewTheme } from '../types';

export const themeService = {
  getThemeCSS(theme: PreviewTheme, forExport: boolean = false): string {
    // Base variables. If exporting, we force specific light-mode colors for better printing/PDFs.
    // If inside the app (Preview), we rely on the CSS variables defined in index.html that react to dark mode.
    const variables = forExport 
      ? `
        :root {
          --bg-main: #ffffff;
          --bg-activity: #f6f8fa;
          --bg-hover: #eaecef;
          --border-color: #d0d7de;
          --text-main: #24292f;
          --text-muted: #57606a;
          --accent-primary: #0969da;
          --accent-hover: #0a53be;
        }
      ` 
      : `/* Variables inherited from index.html */`;

    const commonCSS = `
      .markdown-body {
        line-height: 1.6;
        color: var(--text-main);
        background-color: var(--bg-main);
      }
      .markdown-body > *:first-child { margin-top: 0 !important; }
      .markdown-body p { margin-bottom: 16px; }
      .markdown-body ul, .markdown-body ol { padding-left: 2em; margin-bottom: 16px; }
      .markdown-body li { margin-bottom: 4px; }
      .markdown-body a { color: var(--accent-primary); text-decoration: none; }
      .markdown-body a:hover { text-decoration: underline; }
      .markdown-body img { max-width: 100%; box-sizing: content-box; background-color: #fff; }
      
      /* Code Blocks */
      .markdown-body code {
        background-color: var(--bg-activity);
        padding: 0.2em 0.4em;
        border-radius: 6px;
        font-size: 85%;
      }
      .markdown-body pre {
        padding: 16px;
        border-radius: 6px;
        overflow: auto;
        margin-bottom: 16px;
      }
      .markdown-body pre code {
        background-color: transparent;
        padding: 0;
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace;
      }
      
      /* Tables */
      .markdown-body table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
      .markdown-body th, .markdown-body td { padding: 6px 13px; border: 1px solid var(--border-color); }
      .markdown-body th { background-color: var(--bg-activity); font-weight: 600; }
      .markdown-body tr:nth-child(2n) { background-color: var(--bg-hover); }

      /* Math */
      .katex-display { overflow-x: auto; padding: 0.5em 0; }
      
      /* Mermaid */
      .mermaid { background-color: white; padding: 10px; border-radius: 8px; } 
    `;

    // Specific Theme Overrides
    const themeStyles: Record<PreviewTheme, string> = {
      github: `
        .markdown-body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.3em;
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          color: var(--text-main);
        }
        .markdown-body h1 { font-size: 2em; }
        .markdown-body h2 { font-size: 1.5em; }
        .markdown-body blockquote {
          border-left: 4px solid var(--border-color);
          padding: 0 1em;
          color: var(--text-muted);
          margin: 0 0 16px 0;
        }
      `,
      notion: `
        .markdown-body {
          font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
          font-size: 16px;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          font-family: ui-serif, Lyon-Text, Georgia, YuMincho, "Yu Mincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "Songti TC", "Songti SC", "SimSun", "Nanum Myeongjo", NanumMyeongjo, Batang, serif;
          font-weight: 700;
          margin-top: 32px;
          margin-bottom: 10px;
          color: var(--text-main);
          border: none;
          padding-bottom: 0;
        }
        .markdown-body h1 { font-size: 2.2em; line-height: 1.3; }
        .markdown-body h2 { font-size: 1.6em; }
        .markdown-body blockquote {
          border-left: 3px solid var(--text-main);
          padding-left: 1em;
          font-style: italic;
          font-size: 1.1em;
          margin: 1.5em 0;
        }
        .markdown-body table th { background-color: transparent; border-bottom: 2px solid var(--border-color); }
        .markdown-body table td { border: none; border-bottom: 1px solid var(--border-color); }
        .markdown-body code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; color: #EB5757; background: rgba(135,131,120,0.15); }
      `,
      minimal: `
        .markdown-body {
          font-family: 'Inter', system-ui, sans-serif;
          max-width: 700px;
          margin: 0 auto;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: -0.03em;
          border-bottom: none;
          margin-top: 3em;
          margin-bottom: 1em;
          text-transform: uppercase;
          font-size: 1em; /* Minimalist headings */
          font-weight: 800;
          color: var(--text-muted);
        }
        .markdown-body h1 { font-size: 1.2em; color: var(--text-main); border-bottom: 2px solid var(--text-main); padding-bottom: 10px;}
        .markdown-body p { margin-bottom: 24px; line-height: 1.7; }
        .markdown-body blockquote {
          border-left: 1px solid var(--text-main);
          padding-left: 20px;
          margin-left: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
        }
        .markdown-body table { border: 2px solid var(--text-main); }
        .markdown-body th { background: var(--text-main); color: var(--bg-main); border: 1px solid var(--bg-main); }
        .markdown-body td { border: 1px solid var(--text-main); }
        .markdown-body code { background: transparent; }
      `
    };

    return `
      ${variables}
      ${commonCSS}
      ${themeStyles[theme]}
    `;
  }
};