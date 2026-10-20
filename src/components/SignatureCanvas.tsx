import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';
import { triggerHaptic } from '../services/crypto';

interface SignatureCanvasProps {
  initialSignature?: string;
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  initialSignature,
  onSave,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [inkColor, setInkColor] = useState<'#0a2540' | '#000000'>('#0a2540');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI iPhone screens
    const ratio = window.devicePixelRatio || 2;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
        setHasDrawn(true);
      };
      img.src = initialSignature;
    }
  }, [inkColor, initialSignature]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    triggerHaptic('medium');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    triggerHaptic('success');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PenTool className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono text-white/80 uppercase">Sign in the box below</span>
        </div>

        {/* Ink selector */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setInkColor('#0a2540')}
            className={`w-6 h-6 rounded-full border ${
              inkColor === '#0a2540' ? 'ring-2 ring-emerald-400 border-white' : 'border-white/20'
            } bg-[#0a2540]`}
            title="Royal Blue Ink"
          />
          <button
            type="button"
            onClick={() => setInkColor('#000000')}
            className={`w-6 h-6 rounded-full border ${
              inkColor === '#000000' ? 'ring-2 ring-emerald-400 border-white' : 'border-white/20'
            } bg-black`}
            title="Carbon Black Ink"
          />
        </div>
      </div>

      {/* Signature Canvas Box */}
      <div className="relative w-full h-44 rounded-2xl bg-white/95 border border-white/30 overflow-hidden shadow-inner touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair"
        />

        {/* Guideline line */}
        <div className="absolute bottom-8 left-8 right-8 border-b border-dashed border-gray-300 pointer-events-none flex justify-end">
          <span className="text-[10px] text-gray-400 font-mono">Sign on line ✗</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white/80 active:scale-95 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Canvas</span>
        </button>

        <div className="flex items-center space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/60 active:scale-95"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawn}
            className={`flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-black transition-all ${
              hasDrawn
                ? 'bg-emerald-400 hover:bg-emerald-300 active:scale-95 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                : 'bg-white/20 text-white/40 cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
};
