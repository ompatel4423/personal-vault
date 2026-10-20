import React from 'react';
import { 
  CreditCard, 
  Award, 
  Plane, 
  Fingerprint, 
  QrCode, 
  Wifi, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import type { WalletCard } from '../types/wallet';

interface CardItemProps {
  card: WalletCard;
  onClick: () => void;
  isStacked?: boolean;
  index?: number;
  totalCards?: number;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onClick,
  isStacked = false,
  index = 0,
}) => {
  // Render specific visual badge per type
  const renderCardBadge = () => {
    switch (card.type) {
      case 'passport':
        return (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-mono">
            <Plane className="w-3 h-3" />
            <span>ICAO E-PASSPORT</span>
          </div>
        );
      case 'aadhaar':
        return (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-[10px] font-mono">
            <Fingerprint className="w-3 h-3" />
            <span>UIDAI VERIFIED</span>
          </div>
        );
      case 'bank_card':
        return (
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono">
            <Wifi className="w-3 h-3 rotate-90" />
            <span>CONTACTLESS</span>
          </div>
        );
      case 'metro_card':
        return (
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-400/10 border border-rose-400/20 text-rose-300 text-[10px] font-mono">
            <QrCode className="w-3 h-3" />
            <span>NCMC TRANSIT</span>
          </div>
        );
      case 'marksheet':
        return (
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-400/10 border border-indigo-400/20 text-indigo-300 text-[10px] font-mono">
            <Award className="w-3 h-3" />
            <span>ACADEMIC RECORD</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] font-mono">
            <ShieldCheck className="w-3 h-3" />
            <span>VERIFIED</span>
          </div>
        );
    }
  };

  // Extract key summary value (e.g. Card No, Aadhaar No, Passport No)
  const getPrimaryValue = () => {
    if (card.details['Aadhaar Number']) return String(card.details['Aadhaar Number']);
    if (card.details['Passport No']) return String(card.details['Passport No']);
    if (card.details['Card Number']) return String(card.details['Card Number']);
    if (card.details['PAN Number']) return String(card.details['PAN Number']);
    if (card.details['Licence No']) return String(card.details['Licence No']);
    if (card.details['Current Balance']) return String(card.details['Current Balance']);
    if (card.details['Roll Number']) return `Roll: ${card.details['Roll Number']}`;
    return card.subtitle;
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative w-full cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group ${
        isStacked ? 'hover:-translate-y-2 active:scale-[0.98]' : 'hover:scale-[1.01]'
      }`}
      style={{
        zIndex: 10 + index,
      }}
    >
      {/* Double Bezel Outer Shell */}
      <div className="p-1 rounded-[28px] bg-white/[0.07] border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-md">
        {/* Inner Card Core */}
        <div
          className={`relative h-[190px] w-full rounded-[24px] bg-gradient-to-br ${card.colorScheme.gradient} p-5 flex flex-col justify-between overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]`}
        >
          {/* Subtle background luxury pattern / watermark */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/[0.04] pointer-events-none blur-xl" />
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            {card.type === 'passport' && <Plane className="w-24 h-24 text-amber-300" />}
            {card.type === 'aadhaar' && <Fingerprint className="w-24 h-24 text-emerald-300" />}
            {card.type === 'bank_card' && <CreditCard className="w-24 h-24 text-white" />}
            {card.type === 'marksheet' && <Award className="w-24 h-24 text-indigo-300" />}
          </div>

          {/* Top Row: Title, Subtitle, & Badge */}
          <div className="flex items-start justify-between z-10">
            <div className="text-left max-w-[70%]">
              <span className="text-[10px] font-mono tracking-wider uppercase text-white/60 block">
                {card.category}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight leading-tight truncate drop-shadow-sm">
                {card.title}
              </h3>
              <p className="text-[11px] text-white/70 truncate mt-0.5 font-light">
                {card.subtitle}
              </p>
            </div>
            {renderCardBadge()}
          </div>

          {/* Middle Row (For Bank Cards: EMV Chip + Contactless wave) */}
          {card.type === 'bank_card' && (
            <div className="flex items-center space-x-3 z-10 my-auto">
              {/* Golden metallic EMV chip */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-200/50 shadow-inner flex items-center justify-center p-1">
                <div className="w-full h-full border border-amber-700/30 rounded-xs flex flex-col justify-between">
                  <div className="w-full h-[1px] bg-amber-700/30 mt-1" />
                  <div className="w-full h-[1px] bg-amber-700/30 mb-1" />
                </div>
              </div>
              <Wifi className="w-4 h-4 text-white/70 rotate-90" />
            </div>
          )}

          {/* Bottom Row: Primary masked value & Holder Name / Balance */}
          <div className="flex items-end justify-between z-10">
            <div className="text-left">
              <p className="text-sm font-mono tracking-widest text-white font-medium drop-shadow-md">
                {getPrimaryValue()}
              </p>
              {card.details['Full Name'] || card.details['Cardholder Name'] || card.details['Candidate Name'] ? (
                <p className="text-[10px] uppercase tracking-wider text-white/70 font-mono mt-0.5">
                  {String(
                    card.details['Full Name'] ||
                    card.details['Cardholder Name'] ||
                    card.details['Candidate Name']
                  )}
                </p>
              ) : null}
            </div>

            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-transform group-hover:translate-x-1">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
