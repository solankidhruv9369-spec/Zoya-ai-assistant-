import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, Smartphone, Check, Play } from "lucide-react";

export function InstallModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
            <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-400" />
              Install Zoya AI (APK / App)
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
            
            {/* Download Video Tutorial */}
            <div className="space-y-2 flex flex-col">
              <h3 className="text-sm font-semibold text-neutral-200">How to Download (Video)</h3>
              <div 
                className="w-full aspect-video bg-neutral-950 rounded-xl border border-neutral-800 relative overflow-hidden group cursor-pointer flex items-center justify-center"
                onClick={() => setIsPlaying(true)}
              >
                {!isPlaying ? (
                  <>
                    <img 
                      src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800" 
                      alt="Phone screen thumbnail" 
                      className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                    />
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 p-4 text-center">
                    <Smartphone className="w-10 h-10 text-purple-400 mb-3 animate-pulse" />
                    <p className="text-xs text-neutral-300">
                      Step 1: Tap the menu (three dots) in your browser.<br/><br/>
                      Step 2: Select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.<br/><br/>
                      Step 3: Zoya AI will be downloaded to your device!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Instructions */}
            <div className="space-y-4 text-sm text-neutral-300">
              <h3 className="font-semibold text-neutral-200 border-b border-neutral-800 pb-2">Manual Installation Steps</h3>
              
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5 text-xs text-neutral-400">1</div>
                <div>Open this page in <strong>Chrome</strong> (Android) or <strong>Safari</strong> (iOS).</div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5 text-xs text-neutral-400">2</div>
                <div>
                  Tap the browser menu button:
                  <ul className="list-disc ml-5 mt-1 text-neutral-400 text-xs space-y-1">
                    <li>Android: Three dots ⋮ in top right</li>
                    <li>iOS: Share button ⍗ at bottom</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5 text-xs text-neutral-400">3</div>
                <div>Select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.</div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5 text-xs text-purple-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-purple-300">Done! Open Zoya AI directly from your home screen just like a native APK.</div>
              </div>
            </div>

          </div>
          
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/50">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold tracking-wide transition-colors"
            >
              Got it!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
