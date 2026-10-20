import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check,
  RotateCw, 
  Eye, 
  EyeOff, 
  Trash2, 
  QrCode,
  PenTool,
  PlusCircle,
  Train
} from 'lucide-react';
import type { WalletCard } from '../types/wallet';
import { triggerHaptic } from '../services/crypto';

interface CardDetailModalProps {
  card: WalletCard;
  onClose: () => void;
  onUpdateCard: (updatedCard: WalletCard) => void;
  onDeleteCard: (cardId: string) => void;
  onTriggerAlert: (title: string, subtitle?: string, type?: 'success' | 'security' | 'warning' | 'info') => void;
  onOpenSignatureModal?: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onTriggerAlert,
  onOpenSignatureModal,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [unmaskedKeys, setUnmaskedKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleFlip = () => {
    triggerHaptic('medium');
    setIsFlipped(!isFlipped);
    onTriggerAlert(
      isFlipped ? 'Viewing Card Front' : 'Flipped to Card Back',
      'Encrypted Security View',
      'security'
    );
  };

  const toggleMask = (key: string) => {
    triggerHaptic('light');
    setUnmaskedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const copyToClipboard = (key: string, value: string) => {
    triggerHaptic('success');
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    onTriggerAlert(`${key} Copied`, 'Sensitive clipboard auto-clears in 30s', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Special Transit Metro Card Actions
  const handleMetroTap = () => {
    triggerHaptic('success');
    const cur = parseFloat(String(card.details['Current Balance'] || '0').replace(/[^0-9.]/g, ''));
    const nextVal = Math.max(0, cur - 35);
    const updated = {
      ...card,
      details: {
        ...card.details,
        'Current Balance': `₹ ${nextVal.toFixed(2)}`,
        'Last Tap Station': 'Kashmere Gate Metro Station (Gate 2)',
      },
    };
    onUpdateCard(updated);
    onTriggerAlert('Transit Gate Tapped • -₹35.00', `New Balance: ₹ ${nextVal.toFixed(2)}`, 'success');
  };

  const handleMetroRecharge = () => {
    triggerHaptic('success');
    const cur = parseFloat(String(card.details['Current Balance'] || '0').replace(/[^0-9.]/g, ''));
    const nextVal = cur + 200;
    const updated = {
      ...card,
      details: {
        ...card.details,
        'Current Balance': `₹ ${nextVal.toFixed(2)}`,
      },
    };
    onUpdateCard(updated);
    onTriggerAlert('Metro Card Recharged • +₹200', `Balance: ₹ ${nextVal.toFixed(2)}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0c0c10] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] flex flex-col overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
      >
        {/* Grab Handle for iOS feel */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="text-left">
            <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400">
              {card.category}
            </span>
            <h2 className="text-base font-bold text-white truncate max-w-[240px]">
              {card.title}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFlip}
              type="button"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 text-xs text-white/90 border border-white/10 transition-all font-mono"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isFlipped ? 'Front' : 'Flip 3D'}</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white/80 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1">
          {/* 3D Card Display */}
          <div className="card-perspective w-full h-[210px]">
            <div
              className={`preserve-3d relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD */}
              <div
                className={`backface-hidden absolute inset-0 w-full h-full rounded-[24px] bg-gradient-to-br ${card.colorScheme.gradient} p-5 flex flex-col justify-between border border-white/15 shadow-2xl overflow-hidden`}
              >
                <div className="flex items-start justify-between z-10">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/60">
                      {card.category}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs text-white/70 font-light">{card.subtitle}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Card Center Graphic */}
                <div className="flex items-center justify-between z-10 my-auto">
                  {card.type === 'bank_card' && (
                    <div className="w-12 h-8 rounded bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300 shadow-inner" />
                  )}
                  {card.type === 'passport' && (
                    <span className="text-xs tracking-widest font-mono text-amber-300">
                      PASSPORT • PASSEPORT
                    </span>
                  )}
                  {card.type === 'aadhaar' && (
                    <span className="text-xs tracking-widest font-mono text-emerald-300">
                      भारत सरकार • GOVT OF INDIA
                    </span>
                  )}
                </div>

                <div className="flex items-end justify-between z-10">
                  <div>
                    <p className="text-xs text-white/50 font-mono uppercase">Holder / Subject</p>
                    <p className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                      {String(
                        card.details['Full Name'] ||
                        card.details['Cardholder Name'] ||
                        card.details['Candidate Name'] ||
                        card.details['Name'] ||
                        'AARAV SHARMA'
                      )}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-white/70">
                    SECURED • 256-BIT
                  </span>
                </div>
              </div>

              {/* BACK OF CARD (Flipped) */}
              <div
                className={`backface-hidden rotate-y-180 absolute inset-0 w-full h-full rounded-[24px] bg-[#121217] p-5 flex flex-col justify-between border border-white/20 shadow-2xl overflow-hidden`}
              >
                {/* Magnetic Strip for bank cards */}
                <div className="w-full h-10 bg-black/90 -mx-5 px-5 mt-1 border-y border-white/5 flex items-center justify-end">
                  <span className="text-[9px] font-mono text-white/40 tracking-widest">
                    EMV 3D SECURE CHIP
                  </span>
                </div>

                <div className="flex items-center justify-between z-10 px-2 py-2 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-left">
                    <span className="text-[9px] text-white/50 uppercase font-mono block">
                      SECURITY CODE / CVV
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-400 tracking-widest">
                      {card.details['CVV'] ? String(card.details['CVV']) : '••••'}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'CVV',
                        String(card.details['CVV'] || card.details['VID'] || '834')
                      )
                    }
                    type="button"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/80"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                  <span>Authorized Signature Required</span>
                  <span>Non-Transferable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metro Transit Actions */}
          {card.type === 'metro_card' && (
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/70">Transit Simulation</span>
                <span className="text-xs font-bold text-rose-400">
                  {card.details['Current Balance']}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleMetroTap}
                  type="button"
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-mono active:scale-95 transition-all"
                >
                  <Train className="w-3.5 h-3.5" />
                  <span>Tap Station (-₹35)</span>
                </button>
                <button
                  onClick={handleMetroRecharge}
                  type="button"
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono active:scale-95 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Top-up (+₹200)</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Digital Signature Canvas Action */}
          {card.type === 'signature' && (
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/70">Specimen Signature</span>
                <button
                  onClick={onOpenSignatureModal}
                  type="button"
                  className="flex items-center space-x-1 text-xs text-emerald-400 hover:underline"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Redraw Signature</span>
                </button>
              </div>

              {/* Signature Display preview */}
              <div className="w-full h-32 rounded-xl bg-white/95 border border-white/30 flex items-center justify-center p-4">
                <svg
                  viewBox="0 0 300 100"
                  className="w-full h-full text-indigo-950 fill-none stroke-current"
                  style={{ strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }}
                >
                  <path d="M 20 60 Q 40 20 60 50 T 100 40 Q 140 10 160 70 T 220 50 Q 250 30 280 65" />
                  <path d="M 40 85 L 260 85" strokeDasharray="4 4" strokeWidth="1" stroke="#999" />
                </svg>
              </div>
            </div>
          )}

          {/* Detailed Data Fields */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono tracking-wider uppercase text-white/50 text-left px-1">
              Encrypted Fields & Details
            </h4>

            <div className="space-y-2">
              {Object.entries(card.details).map(([key, val]) => {
                const isSensitive = card.sensitiveKeys.includes(key);
                const isUnmasked = !!unmaskedKeys[key];
                const rawValue = String(val);
                const displayValue = isSensitive && !isUnmasked ? '•••• •••• ••••' : rawValue;
                const isCopied = copiedKey === key;

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-all text-left"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-[10px] uppercase font-mono text-white/50 truncate">
                        {key}
                      </p>
                      <p className="text-xs font-mono text-white/95 font-medium tracking-wide break-all mt-0.5">
                        {displayValue}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {isSensitive && (
                        <button
                          onClick={() => toggleMask(key)}
                          type="button"
                          title={isUnmasked ? 'Hide' : 'Reveal'}
                          className="p-2 rounded-xl hover:bg-white/10 active:scale-95 text-white/60 hover:text-white transition-all"
                        >
                          {isUnmasked ? (
                            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => copyToClipboard(key, rawValue)}
                        type="button"
                        title="Copy to clipboard"
                        className="p-2 rounded-xl hover:bg-white/10 active:scale-95 text-white/60 hover:text-white transition-all"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delete Option */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => {
                triggerHaptic('error');
                if (window.confirm(`Delete ${card.title} from your vault?`)) {
                  onDeleteCard(card.id);
                  onClose();
                  onTriggerAlert('Card Removed', card.title, 'warning');
                }
              }}
              type="button"
              className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 hover:underline px-4 py-2 rounded-xl hover:bg-rose-500/10 transition-all font-mono"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove from Vault</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
