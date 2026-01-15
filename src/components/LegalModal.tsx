import React from "react";
import { X, Shield, Scale, AlertTriangle } from "lucide-react";
import {
  LEGAL_LAST_UPDATED,
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
} from "../legal/legalContent";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-theme-activity border border-theme-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-theme-header border-b border-theme-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-theme-text-main">
              Legal & Privacy
            </h2>
            <p className="text-xs text-theme-text-muted">
              Terms of usage and application disclaimer
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-theme-text-muted hover:text-white transition-colors p-1 rounded-md hover:bg-theme-hover"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 text-sm text-theme-text-muted leading-relaxed">
          {/* Privacy Section */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-theme-accent">
              <Shield size={18} />
              <h3 className="font-bold text-base uppercase tracking-wider">
                Privacy Policy
              </h3>
            </div>
            <p className="text-xs text-theme-text-dim">
              Last updated: {LEGAL_LAST_UPDATED}
            </p>
            <p className="mt-3">{PRIVACY_POLICY.intro}</p>
            <div className="mt-4 space-y-4">
              {PRIVACY_POLICY.sections.map((section) => (
                <div key={section.title}>
                  <div className="font-semibold text-theme-text-main">
                    {section.title}
                  </div>
                  {section.body?.map((line) => (
                    <p key={line} className="mt-2">
                      {line}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-theme-border opacity-50" />

          {/* Disclaimer Section */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-orange-400">
              <AlertTriangle size={18} />
              <h3 className="font-bold text-base uppercase tracking-wider">
                Disclaimer of Warranty
              </h3>
            </div>
            <p className="mb-2">
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
              NONINFRINGEMENT.
            </p>
            <p>
              IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR
              ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
              CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
              WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
            <p className="mt-2 text-theme-text-dim italic">
              (In other words: Please back up your data. The developer is not
              responsible for any data loss, browser crashes, or accidental
              deletions.)
            </p>
          </section>

          <div className="h-px bg-theme-border opacity-50" />

          {/* Terms Section */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-blue-400">
              <Scale size={18} />
              <h3 className="font-bold text-base uppercase tracking-wider">
                Terms of Service
              </h3>
            </div>
            <p className="text-xs text-theme-text-dim">
              Last updated: {LEGAL_LAST_UPDATED}
            </p>
            <p className="mt-3">{TERMS_OF_SERVICE.intro}</p>
            <div className="mt-4 space-y-4">
              {TERMS_OF_SERVICE.sections.map((section) => (
                <div key={section.title}>
                  <div className="font-semibold text-theme-text-main">
                    {section.title}
                  </div>
                  {section.body?.map((line) => (
                    <p key={line} className="mt-2">
                      {line}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-theme-bg border-t border-theme-border shrink-0 text-center">
          <p className="text-xs text-theme-text-dim">
            LocalMark Studio v1.0.0 &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
