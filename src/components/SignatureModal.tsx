import React from 'react';
import { X, PenTool } from 'lucide-react';
import { SignatureCanvas } from './SignatureCanvas';

interface SignatureModalProps {
  onClose: () => void;
  onSaveSignature: (dataUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  onClose,
  onSaveSignature,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0c0c10] border border-white/10 rounded-[32px] p-6 flex flex-col space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <PenTool className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Draw Official Signature</h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <SignatureCanvas
          onSave={(dataUrl) => {
            onSaveSignature(dataUrl);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
