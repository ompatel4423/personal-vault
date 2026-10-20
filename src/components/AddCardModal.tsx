import React, { useState } from 'react';
import { X, Plus, Check, Camera, ImageIcon } from 'lucide-react';
import type { CardType, CardCategory, WalletCard } from '../types/wallet';
import { triggerHaptic } from '../services/crypto';
import { compressImage } from '../services/image';

interface AddCardModalProps {
  onClose: () => void;
  onAddCard: (card: WalletCard) => void;
  onTriggerAlert: (title: string, subtitle?: string, type?: 'success' | 'security' | 'warning' | 'info') => void;
}

const TEMPLATES: Record<
  CardType,
  {
    category: CardCategory;
    title: string;
    subtitle: string;
    gradient: string;
    primary: string;
    details: Record<string, string>;
    sensitiveKeys: string[];
  }
> = {
  passport: {
    category: 'identity',
    title: 'Passport',
    subtitle: 'Official Travel Document',
    gradient: 'from-[#1e1b4b] via-[#0f172a] to-[#020617]',
    primary: '#1e1b4b',
    details: {
      'Full Name': '',
      'Passport No': '',
      'Nationality': 'INDIAN',
      'Date of Birth': '',
      'Date of Expiry': '',
      'Place of Issue': '',
    },
    sensitiveKeys: ['Passport No'],
  },
  aadhaar: {
    category: 'identity',
    title: 'Aadhaar Card',
    subtitle: 'Govt. of India • UIDAI',
    gradient: 'from-[#0e4a3b] via-[#0b382d] to-[#041a14]',
    primary: '#0e4a3b',
    details: {
      'Full Name': '',
      'Aadhaar Number': '',
      'Date of Birth': '',
      'Gender': 'MALE',
      'Address': '',
    },
    sensitiveKeys: ['Aadhaar Number'],
  },
  pan: {
    category: 'identity',
    title: 'PAN Card',
    subtitle: 'Income Tax Department',
    gradient: 'from-[#1e3a8a] via-[#1e293b] to-[#0f172a]',
    primary: '#1e3a8a',
    details: {
      'Full Name': '',
      'PAN Number': '',
      'Father Name': '',
      'Date of Birth': '',
    },
    sensitiveKeys: ['PAN Number'],
  },
  driving_licence: {
    category: 'identity',
    title: 'Driving Licence',
    subtitle: 'Ministry of Road Transport',
    gradient: 'from-[#78350f] via-[#451a03] to-[#1c1917]',
    primary: '#78350f',
    details: {
      'Name': '',
      'Licence No': '',
      'Valid Till': '',
      'Vehicle Classes': 'LMV / MCWG',
      'Blood Group': 'O +ve',
    },
    sensitiveKeys: ['Licence No'],
  },
  voter_id: {
    category: 'identity',
    title: 'Voter ID Card',
    subtitle: 'Election Commission of India',
    gradient: 'from-[#581c87] via-[#3b0764] to-[#1e1b4b]',
    primary: '#581c87',
    details: {
      'Elector Name': '',
      'EPIC Number': '',
      'Father Name': '',
      'Assembly Constituency': '',
    },
    sensitiveKeys: ['EPIC Number'],
  },
  bank_card: {
    category: 'finance',
    title: 'Credit / Debit Card',
    subtitle: 'Visa / Mastercard / RuPay',
    gradient: 'from-[#18181b] via-[#09090b] to-[#000000]',
    primary: '#18181b',
    details: {
      'Bank Name': '',
      'Cardholder Name': '',
      'Card Number': '',
      'Expiry Date': 'MM/YY',
      'CVV': '123',
      'Network': 'VISA',
    },
    sensitiveKeys: ['Card Number', 'CVV'],
  },
  metro_card: {
    category: 'transit',
    title: 'Metro Smart Card',
    subtitle: 'National Common Mobility Card',
    gradient: 'from-[#831843] via-[#4c0519] to-[#1c1917]',
    primary: '#831843',
    details: {
      'Card ID': '',
      'Current Balance': '₹ 500.00',
      'Network': 'Transit NCMC',
    },
    sensitiveKeys: ['Card ID'],
  },
  marksheet: {
    category: 'education',
    title: 'Marksheet / Degree',
    subtitle: 'Board / University Certificate',
    gradient: 'from-[#312e81] via-[#1e1b4b] to-[#0f172a]',
    primary: '#312e81',
    details: {
      'Candidate Name': '',
      'Roll Number': '',
      'School / College': '',
      'Year of Passing': '',
      'Percentage / CGPA': '',
    },
    sensitiveKeys: ['Roll Number'],
  },
  passport_photo: {
    category: 'biometric',
    title: 'Passport Size Photo',
    subtitle: 'Official 35x45mm Biometric',
    gradient: 'from-[#334155] via-[#1e293b] to-[#0f172a]',
    primary: '#334155',
    details: {
      'Subject': '',
      'Dimensions': '35mm x 45mm',
      'Background': 'White',
    },
    sensitiveKeys: [],
  },
  signature: {
    category: 'biometric',
    title: 'Official Specimen Signature',
    subtitle: 'Transparent PNG Vector Specimen',
    gradient: 'from-[#1e1b4b] via-[#0f172a] to-[#020617]',
    primary: '#1e1b4b',
    details: {
      'Signatory Name': '',
      'Purpose': 'General Documents',
    },
    sensitiveKeys: [],
  },
  address: {
    category: 'address',
    title: 'Saved Address',
    subtitle: 'Residential / Work / Delivery',
    gradient: 'from-[#065f46] via-[#047857] to-[#022c22]',
    primary: '#047857',
    details: {
      'Label / Type': 'HOME',
      'Full Name / Contact': '',
      'Flat / House No': '',
      'Street / Society / Area': '',
      'Landmark': '',
      'City': '',
      'State': '',
      'Pincode / ZIP': '',
      'Phone Number': '',
    },
    sensitiveKeys: [],
  },
  custom: {
    category: 'identity',
    title: 'Custom Card / Document',
    subtitle: 'Personal Identification',
    gradient: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
    primary: '#0f172a',
    details: {
      'Name': '',
      'Identifier / No': '',
    },
    sensitiveKeys: ['Identifier / No'],
  },
};

export const AddCardModal: React.FC<AddCardModalProps> = ({
  onClose,
  onAddCard,
  onTriggerAlert,
}) => {
  const [selectedType, setSelectedType] = useState<CardType>('bank_card');
  const [title, setTitle] = useState(TEMPLATES.bank_card.title);
  const [subtitle, setSubtitle] = useState(TEMPLATES.bank_card.subtitle);
  const [fields, setFields] = useState<Record<string, string>>(TEMPLATES.bank_card.details);
  const [frontImage, setFrontImage] = useState<string | undefined>();
  const [backImage, setBackImage] = useState<string | undefined>();

  const handleTypeSelect = (type: CardType) => {
    triggerHaptic('light');
    setSelectedType(type);
    const tmpl = TEMPLATES[type];
    setTitle(tmpl.title);
    setSubtitle(tmpl.subtitle);
    setFields(tmpl.details);
  };

  const handleFieldChange = (key: string, val: string) => {
    setFields((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handlePhotoUpload = async (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('medium');
    try {
      const dataUrl = await compressImage(file);
      if (side === 'front') {
        setFrontImage(dataUrl);
      } else {
        setBackImage(dataUrl);
      }
    } catch {
      onTriggerAlert('Photo Upload Failed', 'Please try a different image', 'warning');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    const tmpl = TEMPLATES[selectedType];

    const newCard: WalletCard = {
      id: `card-${Date.now()}`,
      type: selectedType,
      category: tmpl.category,
      title: title || tmpl.title,
      subtitle: subtitle || tmpl.subtitle,
      frontImage,
      backImage,
      colorScheme: {
        primary: tmpl.primary,
        secondary: '#000000',
        accent: '#38bdf8',
        gradient: tmpl.gradient,
      },
      details: fields,
      sensitiveKeys: tmpl.sensitiveKeys,
      createdAt: new Date().toISOString(),
    };

    onAddCard(newCard);
    onClose();
    onTriggerAlert('Card Added to Vault', newCard.title, 'success');
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-lg bg-[#0c0c10] border-t sm:border border-white/10 rounded-t-[36px] sm:rounded-[32px] max-h-[calc(100dvh-65px)] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        style={{
          marginTop: 'max(env(safe-area-inset-top, 24px) + 10px, 65px)',
        }}
      >
        {/* Grab Handle for iOS feel */}
        <div className="w-full flex justify-center pt-3.5 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-white/25" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5 min-w-0 pr-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">Add New Document</h2>
              <p className="text-[10px] text-white/50 font-mono truncate">Om's Personal Vault</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            type="button"
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 flex items-center justify-center text-white border border-white/20 shrink-0 z-10 transition-all shadow-md cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* Card Type Selector pills */}
          <div>
            <label className="text-[10px] font-mono uppercase text-white/50 block mb-2">
              Select Document / Card Type
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['address', 'Address (Home/Work)'],
                  ['bank_card', 'Bank Card'],
                  ['aadhaar', 'Aadhaar Card'],
                  ['passport', 'Passport'],
                  ['pan', 'PAN Card'],
                  ['driving_licence', 'Driving Licence'],
                  ['voter_id', 'Voter ID'],
                  ['metro_card', 'Metro Card'],
                  ['marksheet', 'Marksheet'],
                  ['passport_photo', 'Passport Photo'],
                  ['signature', 'Signature'],
                  ['custom', 'Custom'],
                ] as const
              ).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                    selectedType === type
                      ? 'bg-emerald-400 text-black font-semibold shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                Card Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                Issuer / Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Fields list */}
          <div className="space-y-3 pt-2">
            <label className="text-[10px] font-mono uppercase text-white/50 block">
              Card Attributes & Details
            </label>
            {Object.entries(fields).map(([key, val]) => (
              <div key={key}>
                <label className="text-[10px] font-mono text-white/60 block mb-1">{key}</label>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  placeholder={`Enter ${key}...`}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            ))}
          </div>

          {/* Optional Real Card Photos */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase text-white/50 block">
                Real Physical Card Photos (Optional)
              </label>
              <span className="text-[10px] text-emerald-400/80 font-mono">Enables 3D Real Card Flip</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Front Photo */}
              <div className="relative border border-dashed border-white/20 hover:border-emerald-400/60 transition-colors rounded-2xl p-3 flex flex-col items-center justify-center text-center bg-white/[0.02] overflow-hidden group">
                {frontImage ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden group">
                    <img src={frontImage} alt="Card Front" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFrontImage(undefined)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-500/80 text-white rounded-full transition-colors"
                      title="Remove Front Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] bg-black/60 rounded text-emerald-400 font-mono">
                      Front Photo
                    </span>
                  </div>
                ) : (
                  <label className="w-full h-24 flex flex-col items-center justify-center cursor-pointer">
                    <Camera className="w-6 h-6 text-white/40 mb-1 group-hover:text-emerald-400 group-hover:scale-110 transition-all" />
                    <span className="text-[10px] font-mono text-white/70 font-semibold">Front Photo</span>
                    <span className="text-[9px] font-mono text-white/40">Tap to upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoUpload('front', e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Back Photo */}
              <div className="relative border border-dashed border-white/20 hover:border-emerald-400/60 transition-colors rounded-2xl p-3 flex flex-col items-center justify-center text-center bg-white/[0.02] overflow-hidden group">
                {backImage ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden group">
                    <img src={backImage} alt="Card Back" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setBackImage(undefined)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-500/80 text-white rounded-full transition-colors"
                      title="Remove Back Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] bg-black/60 rounded text-emerald-400 font-mono">
                      Back Photo
                    </span>
                  </div>
                ) : (
                  <label className="w-full h-24 flex flex-col items-center justify-center cursor-pointer">
                    <ImageIcon className="w-6 h-6 text-white/40 mb-1 group-hover:text-emerald-400 group-hover:scale-110 transition-all" />
                    <span className="text-[10px] font-mono text-white/70 font-semibold">Back Photo</span>
                    <span className="text-[9px] font-mono text-white/40">Tap to upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoUpload('back', e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Submit & Cancel */}
          <div className="grid grid-cols-2 gap-3 pt-4 pb-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-98 text-white font-semibold text-xs tracking-wider uppercase font-mono border border-white/10 transition-all flex items-center justify-center space-x-1.5"
            >
              <X className="w-4 h-4 text-white/70" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs tracking-wider uppercase font-mono shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Save & Encrypt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
