import React, { useState } from 'react';
import { ShieldCheck, Copy, CheckCircle2, AlertTriangle, Eye, CreditCard } from 'lucide-react';
import type { DynamicIslandAlert } from '../types/wallet';
import { triggerHaptic } from '../services/crypto';

interface DynamicIslandProps {
  alert: DynamicIslandAlert | null;
  isLocked: boolean;
  cardsCount: number;
  onClearAlert?: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  alert,
  isLocked,
  cardsCount,
  onClearAlert,
}) => {
  const [isExpandedManual, setIsExpandedManual] = useState(false);

  const isExpanded = !!alert || isExpandedManual;

  const handleToggle = () => {
    triggerHaptic('light');
    setIsExpandedManual(!isExpandedManual);
    if (alert && onClearAlert) onClearAlert();
  };

  const getAlertIcon = () => {
    if (!alert) return null;
    switch (alert.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'security':
        return <Eye className="w-4 h-4 text-cyan-400 shrink-0" />;
      default:
        return <Copy className="w-4 h-4 text-sky-400 shrink-0" />;
    }
  };

  return (
    <header 
      aria-label="iPhone 15 Pro Dynamic Island HUD"
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none pt-2.5 px-4"
    >
      <div
        onClick={handleToggle}
        className={`pointer-events-auto cursor-pointer bg-black text-white rounded-[26px] shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none overflow-hidden relative ${
          isExpanded
            ? 'w-[92%] max-w-[370px] min-h-[58px] px-4 py-2.5 scale-100 ring-2 ring-emerald-500/20'
            : 'w-[124px] h-[35px] px-3 py-1 flex items-center justify-between hover:scale-105 active:scale-95'
        }`}
      >
        {!isExpanded ? (
          // Compact Dynamic Island Pill
          <>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="text-[10px] font-mono tracking-tight text-white/70">
                {isLocked ? 'LOCK' : `${cardsCount} CARDS`}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {/* TrueDepth camera dot simulation */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/5" />
            </div>
          </>
        ) : (
          // Expanded Dynamic Island
          <div className="flex items-center justify-between w-full h-full gap-3 animate-in fade-in zoom-in-95 duration-200">
            {alert ? (
              <>
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    {getAlertIcon()}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-semibold text-white truncate leading-tight">
                      {alert.title}
                    </p>
                    {alert.subtitle && (
                      <p className="text-[10px] text-white/60 truncate font-mono">
                        {alert.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                  ACTIVE
                </div>
              </>
            ) : (
              // Diagnostics HUD
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white tracking-wide">
                      IPHONE 15 PRO VAULT
                    </p>
                    <p className="text-[10px] text-white/50 font-mono">
                      AES-256-GCM • SECURE ENCLAVE
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1 text-[11px] font-mono text-white/80 bg-white/10 px-2 py-1 rounded-full">
                    <CreditCard className="w-3 h-3 text-sky-400" />
                    <span>{cardsCount}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
