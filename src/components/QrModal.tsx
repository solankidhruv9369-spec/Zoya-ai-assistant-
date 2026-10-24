import { motion, AnimatePresence } from "motion/react";
import { X, QrCode, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

export function QrModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const qrRef = useRef<SVGSVGElement>(null);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleDownload = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "zoya-app-qr.png";
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
            <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-pink-500" />
              Share Zoya AI
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 flex flex-col items-center justify-center gap-6">
            <p className="text-sm text-neutral-400 text-center">
              Scan this QR code from any mobile device to open the app instantly.
            </p>
            
            <div className="p-4 bg-white rounded-2xl shadow-xl inline-block">
              <QRCodeSVG
                value={currentUrl}
                size={200}
                level="H"
                includeMargin={true}
                ref={qrRef}
              />
            </div>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl transition-colors font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Download QR Image
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
