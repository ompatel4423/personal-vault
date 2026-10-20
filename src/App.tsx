import { useState, useEffect, useMemo } from 'react';
import type { 
  WalletCard, 
  CardCategory, 
  DynamicIslandAlert, 
  VisualBackgroundMode 
} from './types/wallet';
import { 
  loadCards, 
  saveCards, 
  verifyMasterPin, 
  isVaultInitialized, 
  setMasterPin,
  getStoredBgMode,
  setStoredBgMode
} from './services/storage';
import { triggerHaptic } from './services/crypto';
import { BackgroundManager } from './components/BackgroundManager';
import { DynamicIsland } from './components/DynamicIsland';
import { Header } from './components/Header';
import { CardStack } from './components/CardStack';
import { CardDetailModal } from './components/CardDetailModal';
import { AddCardModal } from './components/AddCardModal';
import { BackupModal } from './components/BackupModal';
import { SignatureModal } from './components/SignatureModal';
import { VaultLockScreen } from './components/VaultLockScreen';
import { TagsSelector, type Tag } from '@/components/ui/tags-selector';
import { Smartphone, Monitor, Tag as TagIcon, ChevronDown, ChevronUp } from 'lucide-react';

const WALLET_TAGS: Tag[] = [
  { id: 'passport', label: 'Passport' },
  { id: 'aadhaar', label: 'Aadhaar' },
  { id: 'bank_card', label: 'Bank Cards' },
  { id: 'pan', label: 'PAN Card' },
  { id: 'driving_licence', label: 'Driving Licence' },
  { id: 'voter_id', label: 'Voter ID' },
  { id: 'metro_card', label: 'Metro' },
  { id: 'marksheet', label: 'Marksheets' },
  { id: 'signature', label: 'Signature' },
  { id: 'passport_photo', label: 'Photo' },
];

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [currentPin, setCurrentPin] = useState('1234');
  const [cards, setCards] = useState<WalletCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<WalletCard | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | 'all'>('all');
  const [bgMode, setBgMode] = useState<VisualBackgroundMode>('crt');
  const [alert, setAlert] = useState<DynamicIslandAlert | null>(null);
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showTagSelector, setShowTagSelector] = useState<boolean>(false);

  // Initialize background mode from storage
  useEffect(() => {
    setBgMode(getStoredBgMode());
  }, []);

  // Trigger Dynamic Island notification
  const triggerAlert = (
    title: string,
    subtitle?: string,
    type: 'success' | 'security' | 'warning' | 'info' = 'info',
    duration = 3200
  ) => {
    const alertId = `alert-${Date.now()}`;
    setAlert({ id: alertId, title, subtitle, type, duration });
    setTimeout(() => {
      setAlert((curr) => (curr?.id === alertId ? null : curr));
    }, duration);
  };

  // Handle Vault Unlock
  const handleUnlock = async (enteredPin: string): Promise<boolean> => {
    const initialized = await isVaultInitialized();
    if (!initialized) {
      await setMasterPin(enteredPin);
    }
    const isValid = await verifyMasterPin(enteredPin);
    if (!isValid) return false;

    try {
      const loaded = await loadCards(enteredPin);
      setCards(loaded);
      setCurrentPin(enteredPin);
      setIsLocked(false);
      triggerAlert('Vault Unlocked', 'AES-256-GCM Secure Enclave', 'success');
      return true;
    } catch {
      return false;
    }
  };

  const handleLockVault = () => {
    setIsLocked(true);
    setSelectedCard(null);
    triggerAlert('Vault Locked', 'Authentication Required', 'security');
  };

  // Save changes to cards
  const handleUpdateCard = async (updatedCard: WalletCard) => {
    const updatedList = cards.map((c) => (c.id === updatedCard.id ? updatedCard : c));
    setCards(updatedList);
    setSelectedCard(updatedCard);
    await saveCards(updatedList, currentPin);
  };

  const handleAddCard = async (newCard: WalletCard) => {
    const updatedList = [newCard, ...cards];
    setCards(updatedList);
    await saveCards(updatedList, currentPin);
  };

  const handleDeleteCard = async (cardId: string) => {
    const updatedList = cards.filter((c) => c.id !== cardId);
    setCards(updatedList);
    setSelectedCard(null);
    await saveCards(updatedList, currentPin);
  };

  const handleSaveSignature = async (dataUrl: string) => {
    // Find or update signature card
    const existing = cards.find((c) => c.type === 'signature');
    if (existing) {
      const updated: WalletCard = {
        ...existing,
        attachments: [{ name: 'signature.png', type: 'image', dataUrl }],
      };
      await handleUpdateCard(updated);
    } else {
      const newCard: WalletCard = {
        id: `card-sig-${Date.now()}`,
        type: 'signature',
        category: 'biometric',
        title: 'Official Specimen Signature',
        subtitle: 'Transparent PNG Vector Specimen',
        colorScheme: {
          primary: '#1e1b4b',
          secondary: '#0f172a',
          accent: '#a78bfa',
          gradient: 'from-[#1e1b4b] via-[#0f172a] to-[#020617]',
        },
        details: {
          'Signatory Name': 'AARAV SHARMA',
          'Updated At': new Date().toLocaleDateString(),
        },
        sensitiveKeys: [],
        attachments: [{ name: 'signature.png', type: 'image', dataUrl }],
        createdAt: new Date().toISOString(),
      };
      await handleAddCard(newCard);
    }
    triggerAlert('Signature Updated', 'Saved & Encrypted', 'success');
  };

  // Filter cards based on search, category, and animated tags
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesCategory =
        selectedCategory === 'all' || card.category === selectedCategory;
      if (!matchesCategory) return false;

      // Filter by selected tags if any are chosen
      if (selectedTags.length > 0) {
        const matchesTag = selectedTags.some(
          (t) => t.id === card.type || card.title.toLowerCase().includes(t.label.toLowerCase())
        );
        if (!matchesTag) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inTitle = card.title.toLowerCase().includes(q);
      const inSubtitle = card.subtitle.toLowerCase().includes(q);
      const inDetails = Object.values(card.details).some((val) =>
        String(val).toLowerCase().includes(q)
      );

      return inTitle || inSubtitle || inDetails;
    });
  }, [cards, selectedCategory, searchQuery, selectedTags]);

  const toggleBackgroundMode = () => {
    const nextMode: VisualBackgroundMode =
      bgMode === 'crt' ? 'koi' : bgMode === 'koi' ? 'stealth' : 'crt';
    setBgMode(nextMode);
    setStoredBgMode(nextMode);
    triggerAlert(
      `Shader Mode: ${nextMode.toUpperCase()}`,
      nextMode === 'crt'
        ? 'CRT Terminal Scanlines'
        : nextMode === 'koi'
        ? 'Koi Shader Fluid'
        : 'Deep Stealth OLED',
      'info',
      2000
    );
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050508] text-white flex flex-col items-center justify-start overflow-x-hidden select-none">
      {/* Visual Shader Backgrounds (CrtBackground, KoiStudies, Stealth) */}
      <BackgroundManager mode={bgMode} />

      {/* Dynamic Island HUD at top */}
      <DynamicIsland
        alert={alert}
        isLocked={isLocked}
        cardsCount={cards.length}
        onClearAlert={() => setAlert(null)}
      />

      {/* Desktop Device Frame Switcher (Useful when testing on laptop/PC) */}
      <div className="hidden lg:flex fixed bottom-4 right-4 z-50 items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-md text-xs font-mono text-white/80 cursor-pointer shadow-lg">
        <button
          onClick={() => {
            triggerHaptic('light');
            setDeviceFrameMode(!deviceFrameMode);
          }}
          type="button"
          className="flex items-center space-x-1.5"
        >
          {deviceFrameMode ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>iPhone 15 Pro Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container: Adapts to either iPhone 15 Pro frame or full viewport */}
      <div
        className={`w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative flex flex-col ${
          deviceFrameMode
            ? 'max-w-[393px] min-h-[852px] my-6 rounded-[55px] border-[10px] border-[#2c2b30] shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_0_2px_rgba(255,255,255,0.1)] overflow-hidden bg-black'
            : 'max-w-md min-h-screen'
        }`}
      >
        {isLocked ? (
          <VaultLockScreen onUnlock={handleUnlock} />
        ) : (
          <div className="flex flex-col w-full flex-1 animate-in fade-in duration-300">
            {/* Header with Search, Filters, Shader Toggle */}
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              bgMode={bgMode}
              onToggleBgMode={toggleBackgroundMode}
              onLockVault={handleLockVault}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenBackupModal={() => setIsBackupModalOpen(true)}
            />

            {/* Interactive Animated Tags Filter Toggle */}
            <div className="px-5 pb-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowTagSelector(!showTagSelector);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/70 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center space-x-2">
                  <TagIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive Tags Filter</span>
                  {selectedTags.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {selectedTags.length} active
                    </span>
                  )}
                </div>
                {showTagSelector ? (
                  <ChevronUp className="w-3.5 h-3.5 text-white/50" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                )}
              </button>

              {showTagSelector && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <TagsSelector
                    tags={WALLET_TAGS}
                    selectedTags={selectedTags}
                    onSelectedChange={setSelectedTags}
                  />
                </div>
              )}
            </div>

            {/* Stacked Cards View with Morphing animations */}
            <CardStack
              cards={filteredCards}
              onSelectCard={setSelectedCard}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          onTriggerAlert={triggerAlert}
          onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        />
      )}

      {isAddModalOpen && (
        <AddCardModal
          onClose={() => setIsAddModalOpen(false)}
          onAddCard={handleAddCard}
          onTriggerAlert={triggerAlert}
        />
      )}

      {isBackupModalOpen && (
        <BackupModal
          onClose={() => setIsBackupModalOpen(false)}
          pin={currentPin}
          onUpdatePin={(newPin) => setCurrentPin(newPin)}
          onRestoreCards={(newCards) => setCards(newCards)}
          onTriggerAlert={triggerAlert}
        />
      )}

      {isSignatureModalOpen && (
        <SignatureModal
          onClose={() => setIsSignatureModalOpen(false)}
          onSaveSignature={handleSaveSignature}
        />
      )}
    </div>
  );
}
