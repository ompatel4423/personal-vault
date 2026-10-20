import React, { useState } from 'react';
import { X, Download, Upload, ShieldCheck, Check } from 'lucide-react';
import { exportVaultEncryptedFile, importVaultEncryptedFile, setMasterPin } from '../services/storage';
import { triggerHaptic } from '../services/crypto';
import type { WalletCard } from '../types/wallet';

interface BackupModalProps {
  onClose: () => void;
  pin: string;
  onRestoreCards: (cards: WalletCard[]) => void;
  onTriggerAlert: (title: string, subtitle?: string, type?: 'success' | 'security' | 'warning' | 'info') => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  onClose,
  pin,
  onRestoreCards,
  onTriggerAlert,
}) => {
  const [newPin, setNewPin] = useState('');
  const [pinChanged, setPinChanged] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      triggerHaptic('success');
      const dataStr = await exportVaultEncryptedFile();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iphone-vault-backup-${new Date().toISOString().slice(0, 10)}.vault`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onTriggerAlert('Encrypted Backup Downloaded', 'Zero-knowledge .vault export', 'success');
    } catch {
      triggerHaptic('error');
      onTriggerAlert('Export Failed', 'No vault payload available', 'warning');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const restored = await importVaultEncryptedFile(text, pin);
        onRestoreCards(restored);
        triggerHaptic('success');
        setImportStatus('Backup restored successfully!');
        onTriggerAlert('Vault Restored', `${restored.length} cards loaded`, 'success');
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch {
        triggerHaptic('error');
        setImportStatus('Decryption failed. Ensure the backup matches this PIN.');
        onTriggerAlert('Restore Failed', 'Invalid PIN for file', 'warning');
      }
    };
    reader.readAsText(file);
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) return;
    try {
      triggerHaptic('success');
      await setMasterPin(newPin);
      setPinChanged(true);
      onTriggerAlert('Master PIN Changed', 'Stored in Secure Enclave', 'security');
      setTimeout(() => setPinChanged(false), 2500);
    } catch {
      triggerHaptic('error');
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0c0c10] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Security & Backup</h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1 text-left">
          {/* Security Architecture info */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Zero-Knowledge Local Encryption</span>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed font-light">
              Unlike Google Sheets or cloud spreadsheets where passport, Aadhaar, and bank card
              numbers sit unencrypted in plaintext, your vault uses client-side <strong>AES-256-GCM</strong>.
              Nothing leaves your iPhone without being ciphertext.
            </p>
          </div>

          {/* Export section */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-white/50 block">
              1. Encrypted Vault Backup
            </label>
            <p className="text-xs text-white/60">
              Download an encrypted copy of your cards. You can save this file in your iCloud Drive or private storage.
            </p>
            <button
              onClick={handleExport}
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 active:scale-98 transition-all flex items-center justify-center space-x-2 text-xs font-mono text-white"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download .vault Backup File</span>
            </button>
          </div>

          {/* Import section */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-white/50 block">
              2. Restore from .vault Backup
            </label>
            <label className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 active:scale-98 transition-all flex items-center justify-center space-x-2 text-xs font-mono text-white/80 cursor-pointer">
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Select .vault File to Restore</span>
              <input
                type="file"
                accept=".json,.vault"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
            {importStatus && (
              <p className="text-[11px] font-mono text-emerald-400 animate-pulse">
                {importStatus}
              </p>
            )}
          </div>

          {/* Change PIN section */}
          <form onSubmit={handleChangePin} className="space-y-3 pt-2">
            <label className="text-[10px] font-mono uppercase text-white/50 block">
              3. Update Master PIN
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="New 4-digit PIN..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={newPin.length !== 4}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  newPin.length === 4
                    ? 'bg-emerald-400 text-black active:scale-95'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                Save PIN
              </button>
            </div>
            {pinChanged && (
              <p className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Master PIN successfully updated!</span>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
