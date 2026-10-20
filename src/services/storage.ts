import type { WalletCard } from '../types/wallet';
import { encryptData, decryptData, type EncryptedPayload } from './crypto';
import { INITIAL_CARDS } from './defaultData';

const STORAGE_KEY = 'iphone_vault_cards_encrypted';
const PIN_HASH_KEY = 'iphone_vault_pin_hash';
const BIOMETRIC_ENABLED_KEY = 'iphone_vault_biometric_enabled';
const BG_MODE_KEY = 'iphone_vault_bg_mode';

// Hash PIN with SHA-256 for quick validation before full AES decryption
async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(`vault_salt_${pin}_salt_vault`));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function isVaultInitialized(): Promise<boolean> {
  return localStorage.getItem(PIN_HASH_KEY) !== null;
}

export async function setMasterPin(newPin: string): Promise<void> {
  const hash = await hashPin(newPin);
  localStorage.setItem(PIN_HASH_KEY, hash);

  // If cards are not yet encrypted, initialize with default cards
  const existingEncrypted = localStorage.getItem(STORAGE_KEY);
  if (!existingEncrypted) {
    const encrypted = await encryptData(INITIAL_CARDS, newPin);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
  }
}

export async function changeMasterPin(oldPin: string, newPin: string): Promise<boolean> {
  const isValid = await verifyMasterPin(oldPin);
  if (!isValid) return false;

  // 1. Decrypt existing cards with oldPin
  const cards = await loadCards(oldPin);

  // 2. Encrypt existing cards with newPin
  const newEncrypted = await encryptData(cards, newPin);
  const newHash = await hashPin(newPin);

  // 3. Atomically update storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newEncrypted));
  localStorage.setItem(PIN_HASH_KEY, newHash);
  return true;
}

export async function verifyMasterPin(pin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(PIN_HASH_KEY);
  if (!storedHash) return true; // first time
  const hash = await hashPin(pin);
  return hash === storedHash;
}

export async function loadCards(pin: string): Promise<WalletCard[]> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // initialize
    const encrypted = await encryptData(INITIAL_CARDS, pin);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
    return INITIAL_CARDS;
  }

  try {
    const payload: EncryptedPayload = JSON.parse(raw);
    const decrypted = await decryptData<WalletCard[]>(payload, pin);
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt vault with provided PIN', err);
    throw new Error('Invalid PIN or corrupted vault data');
  }
}

export async function saveCards(cards: WalletCard[], pin: string): Promise<void> {
  const encrypted = await encryptData(cards, pin);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
}

export async function exportVaultEncryptedFile(): Promise<string> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error('No vault data to export');
  return raw;
}

export async function importVaultEncryptedFile(jsonPayload: string, pin: string): Promise<WalletCard[]> {
  const payload: EncryptedPayload = JSON.parse(jsonPayload);
  const decrypted = await decryptData<WalletCard[]>(payload, pin);
  localStorage.setItem(STORAGE_KEY, jsonPayload);
  return decrypted;
}

export function getStoredBgMode(): 'crt' | 'koi' | 'stealth' {
  return (localStorage.getItem(BG_MODE_KEY) as 'crt' | 'koi' | 'stealth') || 'crt';
}

export function setStoredBgMode(mode: 'crt' | 'koi' | 'stealth') {
  localStorage.setItem(BG_MODE_KEY, mode);
}

export function isBiometricEnabled(): boolean {
  return localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
}

export function setBiometricEnabled(val: boolean) {
  localStorage.setItem(BIOMETRIC_ENABLED_KEY, val ? 'true' : 'false');
}
