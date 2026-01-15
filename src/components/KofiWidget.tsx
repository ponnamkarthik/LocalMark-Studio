import { kofiConfig } from "../config/site";

export default function KofiWidget() {
  if (!kofiConfig.enabled || !kofiConfig.username) return null;

  return (
    <a
      href={`https://ko-fi.com/${kofiConfig.username}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={kofiConfig.buttonText}
      className="fixed bottom-5 right-5 z-60 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold shadow-lg shadow-black/40 ring-1 ring-white/10 transition-transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      style={{
        backgroundColor: kofiConfig.buttonBackgroundColor,
        color: kofiConfig.buttonTextColor,
      }}
    >
      {kofiConfig.buttonText}
    </a>
  );
}
