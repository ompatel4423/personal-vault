import React, { useState } from 'react';
import { X, Download, Upload, ShieldCheck, Check, KeyRound, AlertCircle } from 'lucide-react';
import { exportVaultEncryptedFile, importVaultEncryptedFile, changeMasterPin } from '../services/storage';
import { triggerHaptic } from '../services/crypto';
import type { WalletCard } from '../types/wallet';

interface BackupModalProps {
  onClose: () => void;
  pin: string;
  onUpdatePin?: (newPin: string) => void;
  onRestoreCards: (cards: WalletCard[]) => void;
  onTriggerAlert: (title: string, subtitle?: string, type?: 'success' | 'security' | 'warning' | 'info') => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  onClose,
  pin,
  onUpdatePin,
  onRestoreCards,
  onTriggerAlert,
}) => {
  const [currentPinInput, setCurrentPinInput] = useState(pin);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChanged, setPinChanged] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      triggerHaptic('success');
      const dataStr = await exportVaultEncryptedFile();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `om-vault-backup-${new Date().toISOString().slice(0, 10)}.vault`;
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
    setPinError(null);

    if (newPin.length !== 4) {
      setPinError('New PIN must be 4 digits.');
      triggerHaptic('error');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('New PIN and Confirm PIN do not match.');
      triggerHaptic('error');
      return;
    }

    try {
      const pinToVerify = currentPinInput || pin;
      const ok = await changeMasterPin(pinToVerify, newPin);
      if (!ok) {
        setPinError('Current PIN is incorrect.');
        triggerHaptic('error');
        return;
      }

      triggerHaptic('success');
      onUpdatePin?.(newPin);
      setPinChanged(true);
      setNewPin('');
      setConfirmPin('');
      setCurrentPinInput(newPin);
      onTriggerAlert('PIN Updated', 'Vault re-encrypted with new AES-256 key', 'security');
      setTimeout(() => setPinChanged(false), 2500);
    } catch (err) {
      console.error(err);
      setPinError('Failed to update PIN. Please verify your current PIN.');
      triggerHaptic('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0c0c10] border-t sm:border border-white/10 rounded-t-[36px] sm:rounded-[32px] max-h-[calc(100dvh-100px)] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        style={{
          marginTop: 'max(env(safe-area-inset-top, 24px) + 40px, 100px)',
        }}
      >
        {/* Grab Handle for iOS feel */}
        <div className="w-full flex justify-center pt-5 pb-2 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-white/25" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-4 border-b border-white/10">
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
              Your vault uses client-side <strong>AES-256-GCM</strong>.
              When you change your passcode, all documents and card numbers are securely decrypted and re-encrypted with your new key.
            </p>
          </div>

          {/* Change PIN section */}
          <form onSubmit={handleChangePin} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-white font-semibold text-xs font-mono">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Change Master Passcode</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter current 4-digit PIN"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="New PIN"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Repeat PIN"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {pinError && (
                <div className="flex items-center space-x-1.5 text-rose-400 text-[11px] font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {pinChanged && (
                <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px] font-mono">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Passcode updated & documents re-encrypted!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={newPin.length !== 4 || confirmPin.length !== 4}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  newPin.length === 4 && confirmPin.length === 4
                    ? 'bg-emerald-400 text-black active:scale-98 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                Update & Re-encrypt Vault
              </button>
            </div>
          </form>

          {/* Export section */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-white/50 block">
              1. Download Encrypted Backup
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
        </div>
      </div>
    </div>
  );
};
