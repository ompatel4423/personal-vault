import React from 'react';
import { 
  Lock, 
  Plus, 
  Search, 
  Settings, 
  Tv, 
  Droplet, 
  Moon,
  ShieldCheck
} from 'lucide-react';
import type { CardCategory, VisualBackgroundMode } from '../types/wallet';
import { triggerHaptic } from '../services/crypto';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CardCategory | 'all';
  onCategorySelect: (cat: CardCategory | 'all') => void;
  bgMode: VisualBackgroundMode;
  onToggleBgMode: () => void;
  onLockVault: () => void;
  onOpenAddModal: () => void;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  bgMode,
  onToggleBgMode,
  onLockVault,
  onOpenAddModal,
  onOpenBackupModal,
}) => {
  const categories: { id: CardCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Cards' },
    { id: 'identity', label: 'Identity' },
    { id: 'address', label: 'Addresses' },
    { id: 'finance', label: 'Finance' },
    { id: 'transit', label: 'Transit' },
    { id: 'education', label: 'Education' },
    { id: 'biometric', label: 'Biometrics' },
  ];

  return (
    <div 
      className="w-full flex flex-col space-y-4 px-5 pb-3 z-20"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 24px) + 6px, 68px)' }}
    >
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>Om's Personal Vault</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h1>
            <p className="text-[10px] text-white/50 font-mono tracking-wider">
              IPHONE 15 PRO • ENCRYPTED
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Visual shader mode switch */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onToggleBgMode();
            }}
            type="button"
            title={`Shader Mode: ${bgMode.toUpperCase()}`}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 text-xs text-white/80 border border-white/10 transition-all font-mono"
          >
            {bgMode === 'crt' && <Tv className="w-3.5 h-3.5 text-emerald-400" />}
            {bgMode === 'koi' && <Droplet className="w-3.5 h-3.5 text-cyan-400" />}
            {bgMode === 'stealth' && <Moon className="w-3.5 h-3.5 text-purple-400" />}
            <span className="text-[10px] uppercase font-bold">{bgMode}</span>
          </button>

          {/* Backup modal trigger */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenBackupModal();
            }}
            type="button"
            title="Backup & Settings"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 active:scale-90 flex items-center justify-center text-white/80 transition-all border border-white/10"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Lock Vault */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              onLockVault();
            }}
            type="button"
            title="Lock Vault"
            className="w-9 h-9 rounded-full bg-rose-500/10 hover:bg-rose-500/20 active:scale-90 flex items-center justify-center text-rose-400 transition-all border border-rose-500/20"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Passport, Aadhaar, PAN, Bank, Metro..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 text-white placeholder-white/40 text-xs font-mono tracking-wide focus:outline-none focus:border-emerald-400/50 transition-all shadow-inner"
        />
      </div>

      {/* Category Pills & Add Button */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenAddModal();
          }}
          type="button"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs font-mono shrink-0 shadow-[0_0_12px_rgba(52,211,153,0.3)] active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('light');
                onCategorySelect(cat.id);
              }}
              type="button"
              className={`px-3 py-1.5 rounded-full text-xs font-mono shrink-0 transition-all ${
                isSelected
                  ? 'bg-white/20 text-white font-semibold border border-white/30 shadow-sm'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
