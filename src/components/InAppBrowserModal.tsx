import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  X,
  Minus,
  Maximize2,
  Minimize2,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Search,
  Copy,
  Check,
  Compass,
  Sparkles,
  AlertTriangle
} from "lucide-react";

export interface InAppBrowserState {
  isOpen: boolean;
  url: string;
  title?: string;
  isMinimized?: boolean;
}

interface InAppBrowserModalProps {
  browserState: InAppBrowserState;
  onClose: () => void;
  onUpdateState: (newState: Partial<InAppBrowserState>) => void;
  accentColor?: string;
}

const POPULAR_BOOKMARKS = [
  { name: "Wikipedia", url: "https://en.m.wikipedia.org", icon: "🌐" },
  { name: "DuckDuckGo", url: "https://duckduckgo.com", icon: "🦆" },
  { name: "YouTube", url: "https://www.youtube.com", icon: "▶️" },
  { name: "HackerNews", url: "https://news.ycombinator.com", icon: "📰" },
  { name: "World Time", url: "https://time.is", icon: "⏰" },
  { name: "Weather", url: "https://wttr.in", icon: "⛅" },
];

export const InAppBrowserModal: React.FC<InAppBrowserModalProps> = ({
  browserState,
  onClose,
  onUpdateState,
  accentColor = "border-pink-500",
}) => {
  const { isOpen, url, title, isMinimized = false } = browserState;
  const [currentUrl, setCurrentUrl] = useState<string>(url || "https://en.m.wikipedia.org");
  const [inputUrl, setInputUrl] = useState<string>(url || "https://en.m.wikipedia.org");
  const [history, setHistory] = useState<string[]>([url || "https://en.m.wikipedia.org"]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [showEmbedNotice, setShowEmbedNotice] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync internal state when external url changes
  useEffect(() => {
    if (url && url !== currentUrl) {
      setCurrentUrl(url);
      setInputUrl(url);
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), url]);
      setHistoryIndex((prev) => prev + 1);
      setIsLoading(true);
      setIframeKey((k) => k + 1);
    }
  }, [url]);

  // Handle URL navigation
  const navigateTo = (newUrl: string) => {
    let formatted = newUrl.trim();
    if (!formatted) return;

    // If not a URL, treat as search query
    if (!/^https?:\/\//i.test(formatted)) {
      if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(formatted)) {
        formatted = `https://${formatted}`;
      } else {
        formatted = `https://duckduckgo.com/?q=${encodeURIComponent(formatted)}`;
      }
    }

    setCurrentUrl(formatted);
    setInputUrl(formatted);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), formatted]);
    setHistoryIndex((prev) => prev + 1);
    setIsLoading(true);
    setIframeKey((k) => k + 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const targetUrl = history[historyIndex - 1];
      setHistoryIndex((i) => i - 1);
      setCurrentUrl(targetUrl);
      setInputUrl(targetUrl);
      setIsLoading(true);
      setIframeKey((k) => k + 1);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const targetUrl = history[historyIndex + 1];
      setHistoryIndex((i) => i + 1);
      setCurrentUrl(targetUrl);
      setInputUrl(targetUrl);
      setIsLoading(true);
      setIframeKey((k) => k + 1);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((k) => k + 1);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Derive display domain and title
  const getDomain = (raw: string) => {
    try {
      return new URL(raw).hostname.replace(/^www\./, "");
    } catch {
      return raw;
    }
  };

  if (!isOpen) return null;

  // Minimized Floating Widget
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.9 }}
        className="fixed bottom-24 right-6 z-[130] flex items-center gap-2 p-2 px-3 rounded-2xl bg-neutral-950/90 border border-pink-500/50 backdrop-blur-xl shadow-2xl shadow-pink-500/20 text-neutral-200"
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onUpdateState({ isMinimized: false })}>
          <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 animate-pulse">
            <Globe className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Zoya Web Tab
            </span>
            <span className="text-xs font-semibold text-white max-w-[140px] truncate">
              {title || getDomain(currentUrl)}
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-neutral-800 mx-1" />

        <button
          onClick={() => onUpdateState({ isMinimized: false })}
          title="Restore Tab"
          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          title="Close Tab"
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  // Full In-App Floating Browser Window
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`relative flex flex-col bg-neutral-950 border border-neutral-800/90 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isMaximized
              ? "w-full h-full rounded-none"
              : "w-full max-w-5xl h-[88vh] max-h-[900px] border-pink-500/40 shadow-[0_0_50px_rgba(236,72,153,0.15)]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Window Bar (Mac / Sci-Fi Window Header) */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 select-none">
            {/* Window controls & Tab Pill */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  onClick={onClose}
                  title="Close window"
                  className="w-3.5 h-3.5 rounded-full bg-red-500/80 hover:bg-red-400 transition flex items-center justify-center group cursor-pointer"
                >
                  <X className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition" />
                </button>
                <button
                  onClick={() => onUpdateState({ isMinimized: true })}
                  title="Minimize window"
                  className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition flex items-center justify-center group cursor-pointer"
                >
                  <Minus className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition" />
                </button>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? "Restore window" : "Maximize window"}
                  className="w-3.5 h-3.5 rounded-full bg-green-500/80 hover:bg-green-400 transition flex items-center justify-center group cursor-pointer"
                >
                  {isMaximized ? (
                    <Minimize2 className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition" />
                  ) : (
                    <Maximize2 className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition" />
                  )}
                </button>
              </div>

              {/* Active Tab indicator */}
              <div className="flex items-center gap-2 px-3 py-1 bg-neutral-800/80 border border-neutral-700/60 rounded-xl text-xs font-medium text-neutral-200 max-w-[260px] sm:max-w-xs truncate shadow-inner">
                <Globe className="w-3.5 h-3.5 text-pink-400 flex-shrink-0 animate-spin-slow" />
                <span className="truncate">{title || getDomain(currentUrl)}</span>
              </div>
            </div>

            {/* Right side helper info */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-neutral-800/40 px-2 py-0.5 rounded-lg border border-neutral-700/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zoya In-App Browser
              </span>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Direct link (opens outside iframe)"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-pink-500/15 hover:bg-pink-500/25 text-pink-400 border border-pink-500/30 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">External Tab</span>
              </a>
            </div>
          </div>

          {/* Navigation Bar & URL Input */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-neutral-950 border-b border-neutral-900">
            {/* History & Refresh controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleBack}
                disabled={historyIndex <= 0}
                className="p-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-300 transition cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleForward}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-300 transition cursor-pointer"
                title="Forward"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleReload}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 transition cursor-pointer"
                title="Reload"
              >
                <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-pink-400" : ""}`} />
              </button>
            </div>

            {/* URL Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigateTo(inputUrl);
              }}
              className="flex-1 flex items-center min-w-[240px] relative bg-neutral-900/90 border border-neutral-800 focus-within:border-pink-500/60 rounded-xl px-3 py-1.5 transition"
            >
              <Search className="w-3.5 h-3.5 text-neutral-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter website URL or search query..."
                className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
              />
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  title={copied ? "Copied!" : "Copy URL"}
                  className="p-1 text-neutral-400 hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>

            {/* Quick Bookmark Chips */}
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-0.5">
              {POPULAR_BOOKMARKS.map((b) => (
                <button
                  key={b.name}
                  onClick={() => navigateTo(b.url)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-pink-500/40 transition cursor-pointer whitespace-nowrap"
                >
                  <span>{b.icon}</span>
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Iframe Notice Banner (For sites with X-Frame-Options or CSP) */}
          <div className="bg-neutral-900/60 border-b border-neutral-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="flex items-center gap-2 truncate">
              <Compass className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
              <span className="truncate">
                Viewing: <span className="text-pink-300 font-mono font-medium">{currentUrl}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-neutral-500 hidden sm:inline">
                Agar website load na ho (X-Frame security):
              </span>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 font-semibold underline flex items-center gap-1"
              >
                Direct Kholein
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Iframe Canvas Area */}
          <div className="relative flex-1 w-full bg-neutral-950 overflow-hidden">
            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-sm text-neutral-300">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-pink-500/20 border-t-pink-500 animate-spin" />
                  <Globe className="w-5 h-5 text-pink-400 absolute" />
                </div>
                <p className="mt-3 text-xs font-medium text-neutral-300">
                  Opening {getDomain(currentUrl)} inside Zoya...
                </p>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Zoya in-app floating sandbox active
                </p>
              </div>
            )}

            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={currentUrl}
              title={`Zoya Web View - ${currentUrl}`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setShowEmbedNotice(true);
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation allow-downloads"
              className="w-full h-full border-0 bg-white"
            />
          </div>

          {/* Bottom Status Bar */}
          <div className="px-4 py-2 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Status: Connected</span>
              <span className="text-neutral-600">|</span>
              <span className="hidden sm:inline">Voice & Assistant remain active in background</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpdateState({ isMinimized: true })}
                className="hover:text-pink-400 transition cursor-pointer"
              >
                Minimize to Widget
              </button>
              <button
                onClick={onClose}
                className="hover:text-red-400 transition cursor-pointer font-semibold text-neutral-300"
              >
                Close Tab
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
