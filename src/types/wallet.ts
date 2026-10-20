export type CardCategory =
  | 'identity'
  | 'finance'
  | 'transit'
  | 'education'
  | 'biometric';

export type CardType =
  | 'passport'
  | 'aadhaar'
  | 'pan'
  | 'driving_licence'
  | 'voter_id'
  | 'bank_card'
  | 'metro_card'
  | 'marksheet'
  | 'signature'
  | 'passport_photo'
  | 'custom';

export interface WalletCard {
  id: string;
  type: CardType;
  category: CardCategory;
  title: string;
  subtitle: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    pattern?: string;
  };
  details: Record<string, string | number | boolean>;
  sensitiveKeys: string[]; // Keys that should be masked by default (e.g., CVV, full UID)
  attachments?: {
    name: string;
    type: 'image' | 'pdf';
    dataUrl: string;
  }[];
  favorite?: boolean;
  lastUsed?: string;
  createdAt: string;
}

export interface DynamicIslandAlert {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  duration?: number;
  type?: 'success' | 'warning' | 'info' | 'security';
}

export type VisualBackgroundMode = 'crt' | 'koi' | 'stealth';
