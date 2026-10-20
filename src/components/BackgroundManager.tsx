import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { CrtBackground, KoiStudies } from '@designcodeio/threeui';
import type { VisualBackgroundMode } from '../types/wallet';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

class ShaderErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('WebGL shader fallback triggered:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface BackgroundManagerProps {
  mode: VisualBackgroundMode;
}

export const BackgroundManager: React.FC<BackgroundManagerProps> = ({ mode }) => {
  const fallbackOled = (
    <div className="absolute inset-0 w-full h-full bg-[#030305]">
      <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[20%] right-0 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[140px] pointer-events-none" />
    </div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#050508]">
      <ShaderErrorBoundary fallback={fallbackOled}>
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

        {mode === 'stealth' && fallbackOled}
      </ShaderErrorBoundary>

      {/* Cyberpunk & Apple Glass fine grid vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.75)_100%)]" 
      />
    </div>
  );
};
