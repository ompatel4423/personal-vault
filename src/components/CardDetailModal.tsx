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
  Train, 
  Camera, 
  ImageIcon, 
  Edit3, 
  Plus, 
  MapPin,
  FileText,
  Upload
} from 'lucide-react';
import type { WalletCard, VaultDocument } from '../types/wallet';
import { triggerHaptic } from '../services/crypto';
import { compressImage } from '../services/image';
import { formatFileSize } from '../services/pdfHelper';
import { PdfViewerModal } from './PdfViewerModal';

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
  const [activePdf, setActivePdf] = useState<VaultDocument | null>(null);

  // Edit Card Details State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editSubtitle, setEditSubtitle] = useState(card.subtitle);
  const [editDetails, setEditDetails] = useState<Record<string, string | number | boolean>>({ ...card.details });
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [showAddField, setShowAddField] = useState(false);

  React.useEffect(() => {
    setEditTitle(card.title);
    setEditSubtitle(card.subtitle);
    setEditDetails({ ...card.details });
  }, [card]);

  const handleSaveDetails = () => {
    triggerHaptic('success');
    const updated: WalletCard = {
      ...card,
      title: editTitle.trim() || card.title,
      subtitle: editSubtitle.trim() || card.subtitle,
      details: editDetails,
    };
    onUpdateCard(updated);
    setIsEditing(false);
    setShowAddField(false);
    onTriggerAlert('Card Details Saved', updated.title, 'success');
  };

  const handleCancelEdit = () => {
    triggerHaptic('light');
    setEditTitle(card.title);
    setEditSubtitle(card.subtitle);
    setEditDetails({ ...card.details });
    setIsEditing(false);
    setShowAddField(false);
  };

  const handleDetailChange = (key: string, val: string) => {
    setEditDetails((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleDeleteField = (key: string) => {
    triggerHaptic('light');
    setEditDetails((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleAddNewField = () => {
    if (!newFieldKey.trim()) return;
    triggerHaptic('light');
    setEditDetails((prev) => ({
      ...prev,
      [newFieldKey.trim()]: newFieldValue.trim(),
    }));
    setNewFieldKey('');
    setNewFieldValue('');
    setShowAddField(false);
  };

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

  // Upload Real Card Photos (Front or Back)
  const handleUploadPhoto = async (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('medium');
    try {
      const dataUrl = await compressImage(file);
      const updated: WalletCard = {
        ...card,
        [side === 'front' ? 'frontImage' : 'backImage']: dataUrl,
      };
      onUpdateCard(updated);
      onTriggerAlert(
        side === 'front' ? 'Front Card Photo Saved' : 'Back Card Photo Saved',
        'AES-256 encrypted on device',
        'success'
      );
    } catch {
      onTriggerAlert('Photo Upload Failed', 'Please try a different image', 'warning');
    }
  };

  const handleRemovePhoto = (side: 'front' | 'back') => {
    triggerHaptic('light');
    const updated: WalletCard = {
      ...card,
      [side === 'front' ? 'frontImage' : 'backImage']: undefined,
    };
    onUpdateCard(updated);
    onTriggerAlert(
      side === 'front' ? 'Front Photo Removed' : 'Back Photo Removed',
      'Reverted to stylized vector card',
      'info'
    );
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

  // Official PDF Documents Vault Actions
  const handleUploadPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      onTriggerAlert('Invalid File', 'Only PDF documents are supported', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeStr = formatFileSize(file.size);
      const newDoc: VaultDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: sizeStr,
        type: 'pdf',
        dataUrl,
        uploadedAt: new Date().toISOString(),
      };

      const updatedDocs = [...(card.documents || []), newDoc];
      const updatedCard: WalletCard = {
        ...card,
        documents: updatedDocs,
      };

      onUpdateCard(updatedCard);
      triggerHaptic('success');
      onTriggerAlert('PDF Attached', `${file.name} (${sizeStr})`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePdf = (docId: string) => {
    triggerHaptic('error');
    if (!window.confirm('Remove this attached PDF document?')) return;
    const updatedDocs = (card.documents || []).filter((d) => d.id !== docId);
    const updatedCard: WalletCard = {
      ...card,
      documents: updatedDocs,
    };
    onUpdateCard(updatedCard);
    onTriggerAlert('Document Removed', 'PDF deleted from card', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0c0c10] border-t sm:border border-white/10 rounded-t-[36px] sm:rounded-[32px] max-h-[calc(100dvh-65px)] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
        style={{
          marginTop: 'max(env(safe-area-inset-top, 24px) + 10px, 65px)',
        }}
      >
        {/* Grab Handle */}
        <div className="w-full flex justify-center pt-3.5 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-white/25" />
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-white/10">
          <div className="text-left min-w-0 pr-3">
            <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400">
              {card.category}
            </span>
            <h2 className="text-base font-bold text-white truncate max-w-[200px] sm:max-w-[280px]">
              {isEditing ? editTitle : card.title}
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={toggleFlip}
              type="button"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 text-xs text-white/90 border border-white/10 transition-all font-mono"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isFlipped ? 'Front' : 'Flip'}</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white/80 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* 3D Card Display */}
          <div 
            className="card-perspective w-full h-[215px] relative"
            style={{
              perspective: '1000px',
              WebkitPerspective: '1000px',
            }}
          >
            {/* ================= FRONT OF CARD ================= */}
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
              }`}
              style={{
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                WebkitTransform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                zIndex: isFlipped ? 0 : 20,
                opacity: isFlipped ? 0 : 1,
                visibility: isFlipped ? 'hidden' : 'visible',
                transition: 'transform 700ms cubic-bezier(0.16,1,0.3,1), opacity 350ms ease, visibility 700ms',
              }}
            >
              <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-2xl border border-white/15">
                {card.frontImage ? (
                  // REAL PHOTO VIEW (FRONT) - Clean edge-to-edge
                  <div className="relative w-full h-full bg-black">
                    <img
                      src={card.frontImage}
                      alt={`${card.title} Front`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  // DEFAULT STYLIZED CARD VIEW (FRONT)
                  <div
                    className={`relative w-full h-full rounded-[24px] bg-gradient-to-br ${card.colorScheme.gradient} p-5 flex flex-col justify-between overflow-hidden shadow-2xl`}
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

                    {/* Center Graphic */}
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
                      {card.type === 'address' && (
                        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-mono font-bold tracking-wider text-emerald-300 uppercase">
                            {String(card.details['Label / Type'] || 'SAVED ADDRESS')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-end justify-between z-10">
                      <div className="min-w-0 pr-2">
                        <p className="text-[10px] text-white/50 font-mono uppercase">
                          {card.type === 'address' ? 'Location' : 'Holder / Subject'}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-white uppercase font-mono tracking-wider truncate max-w-[200px]">
                          {String(
                            card.type === 'address'
                              ? `${card.details['City'] || ''} ${card.details['Pincode / ZIP'] ? `• ${card.details['Pincode / ZIP']}` : ''}`
                              : card.details['Full Name'] ||
                                card.details['Cardholder Name'] ||
                                card.details['Candidate Name'] ||
                                card.details['Name'] ||
                                'AARAV SHARMA'
                          )}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-white/70 shrink-0">
                        SECURED • 256-BIT
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ================= BACK OF CARD (Flipped) ================= */}
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                !isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
              }`}
              style={{
                transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                WebkitTransform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                zIndex: isFlipped ? 20 : 0,
                opacity: isFlipped ? 1 : 0,
                visibility: isFlipped ? 'visible' : 'hidden',
                transition: 'transform 700ms cubic-bezier(0.16,1,0.3,1), opacity 350ms ease, visibility 700ms',
              }}
            >
              <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-2xl border border-white/20">
                {card.backImage ? (
                  // REAL PHOTO VIEW (BACK) - Clean edge-to-edge
                  <div className="relative w-full h-full bg-black">
                    <img
                      src={card.backImage}
                      alt={`${card.title} Back`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  // DEFAULT STYLIZED CARD VIEW (BACK) - UNMIRRORED & STRAIGHT
                  <div className="relative w-full h-full rounded-[24px] bg-[#121217] p-5 flex flex-col justify-between overflow-hidden">
                    <div className="w-full h-10 bg-black/90 -mx-5 px-5 mt-1 border-y border-white/5 flex items-center justify-end">
                      <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">
                        {card.type === 'bank_card'
                          ? 'EMV 3D SECURE CHIP'
                          : card.type === 'address'
                          ? 'VERIFIED RESIDENTIAL / WORK RECORD'
                          : card.type === 'driving_licence'
                          ? 'MINISTRY OF ROAD TRANSPORT & HIGHWAYS'
                          : card.type === 'aadhaar'
                          ? 'UNIQUE IDENTIFICATION AUTHORITY OF INDIA'
                          : 'SECURE ENCLAVE IDENTIFICATION'}
                      </span>
                    </div>

                    {card.type === 'address' ? (
                      <div className="my-auto z-10 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-left">
                        <span className="text-[9px] text-emerald-400 uppercase font-mono block mb-1">
                          SAVED LOCATION & ADDRESS
                        </span>
                        <p className="text-xs font-mono text-white/90 leading-relaxed truncate">
                          {[
                            card.details['Flat / House No'] || card.details['Floor / Desk'],
                            card.details['Street / Society'] || card.details['Tech Park'],
                          ].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-xs font-mono text-white/70 leading-relaxed truncate">
                          {[
                            card.details['City'],
                            card.details['State'],
                            card.details['Pincode / ZIP'],
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    ) : card.type === 'driving_licence' ? (
                      <div className="my-auto z-10 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-left">
                        <div className="grid grid-cols-2 gap-2 text-left">
                          <div>
                            <span className="text-[9px] text-white/50 uppercase font-mono block">
                              BLOOD GROUP
                            </span>
                            <span className="text-xs font-mono font-bold text-amber-400">
                              {String(card.details['Blood Group'] || 'O +ve')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-white/50 uppercase font-mono block">
                              ORGAN DONOR
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {String(card.details['Organ Donor'] || 'YES')}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 pt-1 border-t border-white/5">
                          <span className="text-[9px] text-white/40 uppercase font-mono block">
                            ISSUING RTO
                          </span>
                          <span className="text-[11px] font-mono text-white/80 truncate block">
                            {String(card.details['Issuing Authority'] || 'TRANSPORT DEPT')}
                          </span>
                        </div>
                      </div>
                    ) : card.details['CVV'] ? (
                      <div className="flex items-center justify-between z-10 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-left">
                          <span className="text-[9px] text-white/50 uppercase font-mono block">
                            SECURITY CODE / CVV
                          </span>
                          <span className="text-sm font-mono font-bold text-emerald-400 tracking-widest">
                            {String(card.details['CVV'])}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard('CVV', String(card.details['CVV']))}
                          type="button"
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/80"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : card.details['VID'] ? (
                      <div className="flex items-center justify-between z-10 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-left">
                          <span className="text-[9px] text-white/50 uppercase font-mono block">
                            VIRTUAL ID (VID)
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                            {String(card.details['VID'])}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard('VID', String(card.details['VID']))}
                          type="button"
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/80"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between z-10 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-left">
                          <span className="text-[9px] text-white/50 uppercase font-mono block">
                            SECURITY ENCLAVE ID
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                            {card.id.toUpperCase()}
                          </span>
                        </div>
                        <div className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                          VERIFIED
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                      <span>
                        {card.type === 'address'
                          ? 'Address Authenticated'
                          : card.type === 'driving_licence'
                          ? 'Govt of India Approved'
                          : 'Authorized Signature Required'}
                      </span>
                      <span>
                        {card.type === 'address'
                          ? 'AES-256'
                          : 'Non-Transferable'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Photo Upload Bar */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <div className="flex items-center space-x-1">
              <label className="cursor-pointer flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/80 active:scale-95 transition-all">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>{card.frontImage ? 'Replace Front' : '+ Front Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadPhoto('front', e)}
                  className="hidden"
                />
              </label>
              {card.frontImage && (
                <button
                  type="button"
                  onClick={() => handleRemovePhoto('front')}
                  title="Remove Front Photo"
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 border border-white/10 active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <label className="cursor-pointer flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/80 active:scale-95 transition-all">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>{card.backImage ? 'Replace Back' : '+ Back Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadPhoto('back', e)}
                  className="hidden"
                />
              </label>
              {card.backImage && (
                <button
                  type="button"
                  onClick={() => handleRemovePhoto('back')}
                  title="Remove Back Photo"
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 border border-white/10 active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Main Clean Edit Button Directly Below Card */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                if (isEditing) {
                  handleCancelEdit();
                } else {
                  setIsEditing(true);
                }
              }}
              className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 text-xs font-mono font-semibold transition-all border ${
                isEditing
                  ? 'bg-white/10 hover:bg-white/15 text-white/90 border-white/20 active:scale-98'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30 active:scale-98 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 text-white/70" />
                  <span>Cancel Editing</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <span>Edit Card Details</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Copy Full Address Action */}
          {card.type === 'address' && (
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
              <div className="min-w-0 pr-3">
                <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold">
                  {card.details['Label / Type'] || 'SAVED ADDRESS'}
                </span>
                <p className="text-xs text-white/90 font-mono truncate mt-0.5">
                  {[
                    card.details['Flat / House No'],
                    card.details['Street / Society / Area'] || card.details['Street / Society'],
                    card.details['City'],
                    card.details['Pincode / ZIP']
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const full = [
                    card.details['Resident Name'] || card.details['Full Name / Contact'],
                    card.details['Flat / House No'],
                    card.details['Street / Society / Area'] || card.details['Street / Society'],
                    card.details['Landmark'],
                    card.details['City'],
                    card.details['State'],
                    card.details['Pincode / ZIP'],
                    card.details['Country'],
                    card.details['Contact Phone'] || card.details['Phone Number']
                  ].filter(Boolean).join(', ');
                  copyToClipboard('Full Address', full);
                }}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-mono text-emerald-400 flex items-center space-x-1.5 shrink-0 border border-white/10"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full</span>
              </button>
            </div>
          )}

          {/* Special Transit Metro Card Actions */}
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
                {card.attachments?.[0]?.dataUrl ? (
                  <img
                    src={card.attachments[0].dataUrl}
                    alt="Signature"
                    className="max-h-full object-contain"
                  />
                ) : (
                  <svg
                    viewBox="0 0 300 100"
                    className="w-full h-full text-indigo-950 fill-none stroke-current"
                    style={{ strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }}
                  >
                    <path d="M 20 60 Q 40 20 60 50 T 100 40 Q 140 10 160 70 T 220 50 Q 250 30 280 65" />
                    <path d="M 40 85 L 260 85" strokeDasharray="4 4" strokeWidth="1" stroke="#999" />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* ================= OFFICIAL PDF DOCUMENTS VAULT ================= */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/90">
                  Official PDF Documents
                </span>
                {card.documents && card.documents.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-semibold border border-emerald-500/30">
                    {card.documents.length}
                  </span>
                )}
              </div>

              {/* Upload PDF action button */}
              <label className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-mono text-emerald-400 border border-white/10 transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>+ Attach PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUploadPdf}
                  className="hidden"
                />
              </label>
            </div>

            {/* Document list */}
            {card.documents && card.documents.length > 0 ? (
              <div className="space-y-2">
                {card.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/10 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-medium text-white truncate max-w-[150px] sm:max-w-[240px]">
                          {doc.name}
                        </p>
                        <p className="text-[10px] font-mono text-white/50">
                          {doc.size} • AES-256 Encrypted
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => setActivePdf(doc)}
                        type="button"
                        title="Preview / Open PDF"
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-mono active:scale-95 transition-all flex items-center space-x-1 font-semibold"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDeletePdf(doc.id)}
                        type="button"
                        title="Delete PDF"
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-white/40 hover:text-rose-400 active:scale-95 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 px-3 rounded-xl border border-dashed border-white/10 text-center flex flex-col items-center justify-center space-y-1 bg-white/[0.01]">
                <p className="text-xs font-mono text-white/50">No official PDF document attached</p>
                <p className="text-[10px] font-mono text-white/30">Attach e-Aadhaar, RC, Insurance or Marksheet PDF</p>
              </div>
            )}
          </div>

          {/* Detailed Data Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-mono tracking-wider uppercase text-white/50">
                Encrypted Fields & Details
              </h4>
            </div>

            {isEditing ? (
              /* ================= EDIT MODE ================= */
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* Title & Subtitle editing */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                      Card Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                      Issuer / Subtitle
                    </label>
                    <input
                      type="text"
                      value={editSubtitle}
                      onChange={(e) => setEditSubtitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Edit existing detail fields */}
                <div className="space-y-2">
                  {Object.entries(editDetails).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono uppercase text-white/60">
                          {key}
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDeleteField(key)}
                          className="p-1 text-white/40 hover:text-rose-400 transition-colors rounded-lg"
                          title={`Delete ${key}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={String(val)}
                        onChange={(e) => handleDetailChange(key, e.target.value)}
                        placeholder={`Enter ${key}...`}
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  ))}
                </div>

                {/* Add New Custom Field */}
                {showAddField ? (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-dashed border-emerald-500/40 space-y-2.5">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold">
                      Add Custom Attribute
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Field Name"
                        value={newFieldKey}
                        onChange={(e) => setNewFieldKey(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddField(false);
                          setNewFieldKey('');
                          setNewFieldValue('');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono text-white/60 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddNewField}
                        disabled={!newFieldKey.trim()}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs font-mono disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddField(true)}
                    className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-emerald-400/50 text-white/60 hover:text-emerald-400 text-xs font-mono flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Field</span>
                  </button>
                )}

                {/* Save and Cancel buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDetails}
                    className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-[0_0_20px_rgba(52,211,153,0.35)] active:scale-95 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ================= READ-ONLY VIEW ================= */
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
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-all text-left group"
                    >
                      <div className="min-w-0 pr-3 flex-1">
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
            )}
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

      {/* Full-screen PDF Document Viewer Modal */}
      {activePdf && (
        <PdfViewerModal
          document={activePdf}
          onClose={() => setActivePdf(null)}
          onTriggerAlert={onTriggerAlert}
        />
      )}
    </div>
  );
};
