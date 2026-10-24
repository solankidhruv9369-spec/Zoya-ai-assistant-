import { X, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Voice Commands</h2>
                <p className="text-xs text-neutral-400">Try saying these phrases to Zoya</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-mono tracking-widest text-pink-400 uppercase">Entertainment</div>
                <div className="bg-neutral-950/50 rounded-xl p-3 border border-neutral-800 flex items-center gap-3">
                  <span className="text-sm text-neutral-300 font-medium">"Play video [name of video]"</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">Navigation</div>
                <div className="bg-neutral-950/50 rounded-xl p-3 border border-neutral-800 flex items-center gap-3">
                  <span className="text-sm text-neutral-300 font-medium">"Open website [website name/url]"</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">Utility</div>
                <div className="bg-neutral-950/50 rounded-xl p-3 border border-neutral-800 flex items-center gap-3">
                  <span className="text-sm text-neutral-300 font-medium">"What time is it?"</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Easter Egg</div>
                <div className="bg-neutral-950/50 rounded-xl p-3 border border-neutral-800 flex items-center gap-3">
                  <span className="text-sm text-neutral-300 font-medium">"Zoya, upgrade ho jao"</span>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-neutral-500 font-mono pt-2">
              Speak naturally, Zoya understands context.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
