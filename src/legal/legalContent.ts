export const SITE_NAME = "LocalMark Studio";
export const SITE_URL = "https://editor.karthikponnam.dev";

// Keep this in one place so the website pages and the in-app modal always match.
export const LEGAL_LAST_UPDATED = "2026-01-15";

export type LegalSection = {
  title: string;
  body?: string[];
  bullets?: string[];
};

export const PRIVACY_POLICY: {
  title: string;
  intro: string;
  sections: LegalSection[];
} = {
  title: "Privacy Policy",
  intro:
    "LocalMark Studio is a local-first web application. This policy explains what data is stored, where it is stored, and how it is used.",
  sections: [
    {
      title: "What we store",
      body: [
        "Your notes, folders, tags, and metadata are stored locally on your device.",
      ],
      bullets: [
        "Document content you create inside the editor",
        "Folder/file structure (your organization)",
        "Tags and custom metadata you add",
        "UI preferences (e.g., sidebar/preview toggles and theme preferences)",
      ],
    },
    {
      title: "Where your data is stored",
      body: [
        "LocalMark Studio stores data in your browser storage to keep the app fast and private.",
      ],
      bullets: [
        "IndexedDB for files, folders, and document content",
        "LocalStorage for small UI preferences",
      ],
    },
    {
      title: "What we do NOT do",
      bullets: [
        "We do not upload your documents to a server by default",
        "We do not sell your data",
        "We do not run analytics or tracking scripts in the application",
      ],
    },
    {
      title: "Data retention and deletion",
      body: ["Your data remains on your device until you remove it."],
      bullets: [
        "If you clear your browser data/site storage, your LocalMark Studio data may be deleted",
        "Private browsing/incognito mode may not persist data reliably",
      ],
    },
    {
      title: "Backups and exports",
      body: [
        "Because storage is local-first, you are responsible for backups.",
      ],
      bullets: [
        "Use export options (Markdown/HTML/PDF/JSON) to back up important work",
        "Consider storing exports in your own backup system (e.g., Git, cloud drive, external disk)",
      ],
    },
    {
      title: "Contact",
      body: [
        "If you have questions about privacy, contact the site owner/maintainer.",
      ],
    },
  ],
};

export const TERMS_OF_SERVICE: {
  title: string;
  intro: string;
  sections: LegalSection[];
} = {
  title: "Terms of Service",
  intro:
    "By using LocalMark Studio, you agree to the following terms. If you do not agree, do not use the application.",
  sections: [
    {
      title: "Use of the application",
      bullets: [
        "You are responsible for the content you create and store",
        "You agree not to use the application for unlawful purposes",
      ],
    },
    {
      title: "Local storage and responsibility",
      body: [
        "LocalMark Studio stores your content locally in your browser storage.",
      ],
      bullets: [
        "You understand that clearing site data may delete your files",
        "You are responsible for exporting/backing up your data",
      ],
    },
    {
      title: "No warranty",
      body: [
        'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.',
      ],
    },
    {
      title: "Limitation of liability",
      body: [
        "IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.",
      ],
    },
    {
      title: "Changes",
      body: [
        "We may update these terms from time to time. The latest version will be posted on this page.",
      ],
    },
  ],
};
