import React from 'react';
import { 
  CreditCard, 
  Sparkles, 
  Plane, 
  Fingerprint, 
  ShieldCheck, 
  Car, 
  UserCheck, 
  Train, 
  Award, 
  Camera, 
  PenTool 
} from 'lucide-react';
import type { WalletCard } from '../types/wallet';
import { MorphingCardStack, type CardData } from '@/components/ui/morphing-card-stack';
import { triggerHaptic } from '../services/crypto';

interface CardStackProps {
  cards: WalletCard[];
  onSelectCard: (card: WalletCard) => void;
  onOpenAddModal: () => void;
}

export const CardStack: React.FC<CardStackProps> = ({
  cards,
  onSelectCard,
  onOpenAddModal,
}) => {
  const handleCardClick = (card: WalletCard) => {
    triggerHaptic('light');
    onSelectCard(card);
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'passport':
        return <Plane className="h-5 w-5 text-amber-300" />;
      case 'aadhaar':
        return <Fingerprint className="h-5 w-5 text-emerald-400" />;
      case 'pan':
        return <ShieldCheck className="h-5 w-5 text-sky-400" />;
      case 'driving_licence':
        return <Car className="h-5 w-5 text-amber-500" />;
      case 'voter_id':
        return <UserCheck className="h-5 w-5 text-purple-400" />;
      case 'bank_card':
        return <CreditCard className="h-5 w-5 text-white" />;
      case 'metro_card':
        return <Train className="h-5 w-5 text-rose-400" />;
      case 'marksheet':
        return <Award className="h-5 w-5 text-indigo-400" />;
      case 'passport_photo':
        return <Camera className="h-5 w-5 text-slate-300" />;
      case 'signature':
        return <PenTool className="h-5 w-5 text-violet-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-emerald-400" />;
    }
  };

  const morphingCards: CardData[] = cards.map((c) => {
    const summary =
      c.details['Aadhaar Number'] ||
      c.details['Passport No'] ||
      c.details['Card Number'] ||
      c.details['PAN Number'] ||
      c.details['Licence No'] ||
      c.details['Current Balance'] ||
      c.details['Roll Number'] ||
      c.subtitle;

    return {
      id: c.id,
      title: c.title,
      description: `${String(summary)} • ${c.subtitle}`,
      icon: getCardIcon(c.type),
      color: c.colorScheme.primary,
      tag: c.category.toUpperCase(),
      image: c.frontImage,
    };
  });

  if (cards.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
          <CreditCard className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">No Cards Found</h3>
          <p className="text-xs text-white/50 font-mono mt-1">
            No matching documents or records in this filter
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          type="button"
          className="px-5 py-2.5 rounded-2xl bg-emerald-400 text-black font-semibold text-xs font-mono active:scale-95 transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)]"
        >
          Add New Document
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-5 pb-24 z-10 flex flex-col space-y-3">
      {/* Records count header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono text-white/50 tracking-wider uppercase">
          {cards.length} {cards.length === 1 ? 'RECORD' : 'RECORDS'} SECURED
        </span>
      </div>

      {/* Modern Icon-Only Morphing Card Stack (Stack, Grid, List) */}
      <div className="py-2">
        <MorphingCardStack
          cards={morphingCards}
          onCardClick={(clicked) => {
            const matched = cards.find((c) => c.id === clicked.id);
            if (matched) handleCardClick(matched);
          }}
        />
      </div>
    </div>
  );
};
