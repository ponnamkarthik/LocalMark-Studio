import { kofiConfig } from "../config/site";

export default function KofiWidget() {
  if (!kofiConfig.enabled || !kofiConfig.username) return null;

  return (
    <a
      href={`https://ko-fi.com/${kofiConfig.username}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={kofiConfig.buttonText}
      className="fixed bottom-5 right-5 z-60 inline-flex items-center justify-center rounded-full px-5 py-3 text-base font-semibold shadow-lg shadow-black/40 ring-1 ring-white/10 transition-transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      style={{
        backgroundColor: kofiConfig.buttonBackgroundColor,
        color: kofiConfig.buttonTextColor,
      }}
    >
      <img
        id="kofi-widget-overlay-64b17707-b3c5-4fe1-9cda-b403dc7a6500-donate-button-image"
        src="https://storage.ko-fi.com/cdn/cup-border.png"
        className="mr-2 h-6 w-6"
        data-rotation="0"
        alt=""
        aria-hidden="true"
      ></img>
      {kofiConfig.buttonText}
    </a>
  );
}
