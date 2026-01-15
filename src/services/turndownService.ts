import TurndownService from 'turndown';

// Initialize Turndown service
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
});

// Remove metadata, scripts, and styles so their text content doesn't pollute the markdown
turndownService.remove(['style', 'script', 'noscript', 'head', 'title', 'meta', 'link', 'object', 'iframe']);

// Add basic rules to improve GFM compatibility
turndownService.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: function (content) {
    return '~' + content + '~';
  }
});

turndownService.addRule('taskListItems', {
  filter: function (node) {
    return node.type === 'checkbox' && (node.parentNode as HTMLElement).nodeName === 'LI';
  },
  replacement: function (content, node) {
    return (node as HTMLInputElement).checked ? '[x] ' : '[ ] ';
  }
});

// Clean up ChatGPT specific wrappers or excessive divs
turndownService.addRule('cleanDivs', {
  filter: ['div'],
  replacement: function (content) {
    return '\n' + content + '\n';
  }
});

export const htmlToMarkdown = (html: string): string => {
  return turndownService.turndown(html);
};