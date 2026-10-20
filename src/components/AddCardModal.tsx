import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import type { CardType, CardCategory, WalletCard } from '../types/wallet';
import { triggerHaptic } from '../services/crypto';

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
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0c0c10] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Add to Om's Personal Vault</h2>
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
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* Card Type Selector pills */}
          <div>
            <label className="text-[10px] font-mono uppercase text-white/50 block mb-2">
              Select Document / Card Type
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
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

          {/* Submit */}
          <div className="pt-4 pb-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs tracking-wider uppercase font-mono shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Save & Encrypt Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
