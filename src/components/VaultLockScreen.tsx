import React, { useState } from 'react';
import { Shield, Delete, Lock, Sparkles, RotateCcw } from 'lucide-react';
import { ShaderButtons } from '@designcodeio/threeui';
import { triggerHaptic } from '../services/crypto';

interface VaultLockScreenProps {
  onUnlock: (pin: string) => Promise<boolean>;
  isFirstSetup?: boolean;
}

export const VaultLockScreen: React.FC<VaultLockScreenProps> = ({
  onUnlock,
  isFirstSetup = false,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDigit = async (num: string) => {
    if (pin.length >= 4 || isVerifying) return;
    triggerHaptic('light');

    const nextPin = pin + num;
    setPin(nextPin);

    if (nextPin.length === 4) {
      setIsVerifying(true);
      try {
        const ok = await onUnlock(nextPin);
        if (!ok) {
          triggerHaptic('error');
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
            setIsVerifying(false);
          }, 600);
        } else {
          triggerHaptic('success');
        }
      } catch {
        triggerHaptic('error');
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
          setIsVerifying(false);
        }, 600);
      }
    }
  };

  const handleDelete = () => {
    triggerHaptic('medium');
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    triggerHaptic('medium');
    setPin('');
    setError(false);
  };

  return (
    <div 
      className="relative z-20 flex flex-col items-center justify-between min-h-screen w-full max-w-md mx-auto px-6 pb-12 select-none"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 24px) + 8px, 75px)' }}
    >
      {/* Top Header */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.05)]">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>{isFirstSetup ? 'Initialize Vault PIN' : "Om's Personal Vault"}</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </h1>
          <p className="text-xs text-white/50 font-mono mt-1">
            {isFirstSetup
              ? 'Enter a 4-digit Master Key to encrypt your documents'
              : 'End-to-End Encrypted • iPhone 15 Pro Enclave'}
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center space-x-4 pt-4">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  error
                    ? 'bg-rose-500 scale-110 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-bounce'
                    : isFilled
                    ? 'bg-emerald-400 scale-125 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                    : 'bg-white/20 border border-white/10'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-mono animate-pulse">
            Incorrect Passcode. Please try again.
          </p>
        )}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-[290px] grid grid-cols-3 gap-y-4 gap-x-5 my-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            type="button"
            className="w-18 h-18 mx-auto rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-white text-2xl font-light transition-all active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          >
            <span>{digit}</span>
          </button>
        ))}

        {/* Clear action */}
        <button
          onClick={handleClear}
          type="button"
          title="Clear PIN"
          className="w-18 h-18 mx-auto rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 flex flex-col items-center justify-center text-white/50 hover:text-white transition-all active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[9px] font-mono mt-0.5">Clear</span>
        </button>

        {/* Digit 0 */}
        <button
          onClick={() => handleDigit('0')}
          type="button"
          className="w-18 h-18 mx-auto rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-white text-2xl font-light transition-all active:scale-95"
        >
          <span>0</span>
        </button>

        {/* Backspace */}
        <button
          onClick={handleDelete}
          type="button"
          title="Backspace"
          className="w-18 h-18 mx-auto rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Shader Button and Demo Bypass Info */}
      <div className="w-full flex flex-col items-center space-y-3">
        <div className="w-full max-w-[280px] h-[52px] relative rounded-2xl overflow-hidden border border-white/15 shadow-xl group">
          <button
            type="button"
            onClick={() => {
              if (pin.length === 4) {
                handleDigit('');
              } else {
                onUnlock('1234');
              }
            }}
            className="absolute inset-0 z-10 w-full h-full flex items-center justify-center cursor-pointer bg-black/40 hover:bg-black/20 backdrop-blur-sm transition-all"
          >
            <span className="flex items-center space-x-2 text-xs font-semibold text-white tracking-wider uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{pin.length === 4 ? 'Unlock Vault' : 'Quick Demo Unlock'}</span>
            </span>
          </button>
          <ShaderButtons
            variant="plasma-button"
            mode="dark"
            hue={0}
            saturation={1.0}
            brightness={1.0}
            className="w-full h-full pointer-events-none"
          />
        </div>

        <p className="text-[11px] text-white/40 font-mono text-center">
          Default Master PIN: <span className="text-emerald-400 font-bold">1234</span> • Or enter customized PIN
        </p>
      </div>
    </div>
  );
};
