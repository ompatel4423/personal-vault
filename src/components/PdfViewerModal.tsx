import React from 'react';
import { X, Download, Share2, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import type { VaultDocument } from '../types/wallet';
import { triggerHaptic } from '../services/crypto';

interface PdfViewerModalProps {
  document: VaultDocument;
  onClose: () => void;
  onTriggerAlert: (title: string, subtitle?: string, type?: 'success' | 'security' | 'warning' | 'info') => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  document,
  onClose,
  onTriggerAlert,
}) => {
  const handleDownload = () => {
    try {
      triggerHaptic('success');
      const a = window.document.createElement('a');
      a.href = document.dataUrl;
      a.download = document.name.endsWith('.pdf') ? document.name : `${document.name}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      onTriggerAlert('PDF Downloaded', document.name, 'success');
    } catch {
      triggerHaptic('error');
      onTriggerAlert('Download Failed', 'Could not save PDF', 'warning');
    }
  };

  const handleShare = async () => {
    triggerHaptic('light');

    // Attempt native file sharing on iOS / mobile
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Convert dataUrl to blob/file for native share
        const res = await fetch(document.dataUrl);
        const blob = await res.blob();
        const file = new File([blob], document.name.endsWith('.pdf') ? document.name : `${document.name}.pdf`, {
          type: 'application/pdf',
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: document.name,
            text: `Official Document: ${document.name} (AES-256 Decrypted)`,
          });
          onTriggerAlert('Shared Successfully', document.name, 'success');
          return;
        }
      } catch (err) {
        // If user cancelled sharing, don't show error
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    // Fallback: trigger download
    handleDownload();
  };

  const handleOpenInNewTab = () => {
    triggerHaptic('light');
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${document.dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
      newWindow.document.title = document.name;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl h-full sm:h-[90vh] bg-[#0c0c10] border-0 sm:border border-white/10 rounded-none sm:rounded-[32px] flex flex-col overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)]"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 24px), 24px)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 20px), 20px)',
        }}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 text-left">
              <h3 className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[320px]">
                {document.name}
              </h3>
              <div className="flex items-center space-x-2 text-[10px] text-white/50 font-mono">
                <span>{document.size || 'PDF'}</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 inline" />
                  <span>AES-256 Encrypted</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleShare}
              type="button"
              title="Share / AirDrop PDF"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white/90 border border-white/10 transition-all flex items-center space-x-1 text-xs font-mono"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handleDownload}
              type="button"
              title="Download PDF file"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white/90 border border-white/10 transition-all flex items-center space-x-1 text-xs font-mono"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={handleOpenInNewTab}
              type="button"
              title="Open Fullscreen in New Window"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white/80 border border-white/10 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              type="button"
              aria-label="Close PDF Viewer"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white/80 transition-all shrink-0 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Frame / Viewer Container */}
        <div className="flex-1 w-full bg-[#14141a] relative flex flex-col p-2 sm:p-4 overflow-hidden">
          <object
            data={document.dataUrl}
            type="application/pdf"
            className="w-full h-full rounded-2xl border border-white/10 shadow-2xl bg-[#1e1e28]"
          >
            <iframe
              src={document.dataUrl}
              title={document.name}
              className="w-full h-full rounded-2xl border border-white/10 shadow-2xl bg-white"
            >
              {/* Fallback if browser blocks embedded PDF display */}
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                <FileText className="w-16 h-16 text-emerald-400/60" />
                <h4 className="text-base font-bold text-white">{document.name}</h4>
                <p className="text-xs text-white/60 font-mono max-w-sm">
                  This PDF document is safely decrypted. Tap below to download or open full-screen in Safari.
                </p>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={handleDownload}
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-mono font-bold text-xs active:scale-95 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs active:scale-95 transition-all flex items-center space-x-2 border border-white/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Tab</span>
                  </button>
                </div>
              </div>
            </iframe>
          </object>
        </div>

        {/* Bottom Quick Bar */}
        <div className="px-5 py-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50 shrink-0">
          <span>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</span>
          <button
            onClick={handleDownload}
            type="button"
            className="text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>Save to Files / iCloud</span>
          </button>
        </div>
      </div>
    </div>
  );
};
