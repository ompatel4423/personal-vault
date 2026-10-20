import React from 'react';
import { CrtBackground, KoiStudies } from '@designcodeio/threeui';
import type { VisualBackgroundMode } from '../types/wallet';

interface BackgroundManagerProps {
  mode: VisualBackgroundMode;
}

export const BackgroundManager: React.FC<BackgroundManagerProps> = ({ mode }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#050508]">
      {mode === 'crt' && (
        <div className="absolute inset-0 w-full h-full opacity-70">
          <CrtBackground
            variant="terminal"
            speed={1.0}
            typeSpeed={1.0}
            motion={1.0}
            hue={0}
            saturation={1.0}
            brightness={0.85}
            opacity={0.8}
            className="w-full h-full"
          />
        </div>
      )}

      {mode === 'koi' && (
        <div className="absolute inset-0 w-full h-full opacity-60">
          <KoiStudies className="w-full h-full" />
        </div>
      )}

      {mode === 'stealth' && (
        <div className="absolute inset-0 w-full h-full bg-[#030305]">
          {/* Subtle Apple-style radial ambient glow for OLED */}
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-[20%] right-0 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[140px] pointer-events-none" />
        </div>
      )}

      {/* Cyberpunk & Apple Glass fine grid vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.75)_100%)]" 
      />
    </div>
  );
};
