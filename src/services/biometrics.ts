/**
 * WebAuthn Native Biometric Authentication Engine
 * Supports Apple Face ID / Touch ID on iPhone & Mac, Windows Hello, and Android Biometrics.
 * Uses PublicKeyCredential API with platform authenticators.
 */

import { triggerHaptic } from './crypto';

const BIOMETRIC_CRED_KEY = 'vault_biometric_cred_id';
const BIOMETRIC_PAYLOAD_KEY = 'vault_biometric_payload';
const BIOMETRIC_SALT_KEY = 'vault_biometric_salt';

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Checks if device hardware supports platform biometrics (Face ID, Touch ID, Windows Hello)
 */
export async function isBiometricsAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;
  if (!window.isSecureContext) return false;

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Detects device biometric label (Face ID on modern iPhones, Touch ID on older/Macs, or Biometrics)
 */
export function getBiometricLabel(): string {
  if (typeof navigator === 'undefined') return 'Biometrics';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua)) {
    // iPhones without home button support Face ID
    const hasNotchOrIsland = window.screen.height >= 812 || window.screen.width >= 812;
    return hasNotchOrIsland ? 'Face ID' : 'Touch ID';
  }
  if (/Macintosh/.test(ua)) return 'Touch ID';
  if (/Windows/.test(ua)) return 'Windows Hello';
  return 'Biometrics';
}

/**
 * Checks if biometrics has already been enrolled in this vault
 */
export function isBiometricsEnrolled(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return !!localStorage.getItem(BIOMETRIC_CRED_KEY) && !!localStorage.getItem(BIOMETRIC_PAYLOAD_KEY);
}

/**
 * Enrolls device biometrics (Face ID / Touch ID) and securely stores Master PIN
 */
export async function registerBiometrics(pin: string): Promise<{ success: boolean; error?: string }> {
  const available = await isBiometricsAvailable();
  if (!available) {
    return { success: false, error: 'Hardware biometrics not supported or available on this device.' };
  }

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: "Om's Personal Vault",
          id: window.location.hostname || 'localhost',
        },
        user: {
          id: userId,
          name: 'om',
          displayName: 'Om Patel',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
      },
    })) as PublicKeyCredential;

    if (!credential) {
      return { success: false, error: 'Biometric registration was cancelled.' };
    }

    const credId = bufferToBase64(credential.rawId);

    // Derive a unique device storage key for PIN protection
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(credId.slice(0, 32)),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const encKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 10000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipherBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encKey,
      new TextEncoder().encode(pin)
    );

    const payload = {
      iv: bufferToBase64(iv),
      cipher: bufferToBase64(cipherBuffer),
    };

    localStorage.setItem(BIOMETRIC_CRED_KEY, credId);
    localStorage.setItem(BIOMETRIC_SALT_KEY, bufferToBase64(salt));
    localStorage.setItem(BIOMETRIC_PAYLOAD_KEY, JSON.stringify(payload));

    triggerHaptic('success');
    return { success: true };
  } catch (err: unknown) {
    console.error('Biometric enrollment error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown biometric error';
    return { success: false, error: msg };
  }
}

/**
 * Prompts native iOS Face ID / Touch ID and decrypts Master PIN upon success
 */
export async function authenticateWithBiometrics(): Promise<{ success: boolean; pin?: string; error?: string }> {
  const credIdStr = localStorage.getItem(BIOMETRIC_CRED_KEY);
  const payloadStr = localStorage.getItem(BIOMETRIC_PAYLOAD_KEY);
  const saltStr = localStorage.getItem(BIOMETRIC_SALT_KEY);

  if (!credIdStr || !payloadStr || !saltStr) {
    return { success: false, error: 'Biometrics not enrolled yet.' };
  }

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credId = base64ToBuffer(credIdStr);

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname || 'localhost',
        allowCredentials: [
          {
            type: 'public-key',
            id: credId as unknown as BufferSource,
          },
        ],
        userVerification: 'required',
      },
    });

    if (!assertion) {
      return { success: false, error: 'Biometric verification cancelled.' };
    }

    // Biometric verified! Decrypt stored Master PIN
    const salt = base64ToBuffer(saltStr);
    const { iv, cipher } = JSON.parse(payloadStr);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(credIdStr.slice(0, 32)),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const encKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: 10000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBuffer(iv) as unknown as BufferSource },
      encKey,
      base64ToBuffer(cipher) as unknown as BufferSource
    );

    const pin = new TextDecoder().decode(decryptedBuffer);
    triggerHaptic('success');
    return { success: true, pin };
  } catch (err: unknown) {
    console.error('Biometric auth error:', err);
    const msg = err instanceof Error ? err.message : 'Biometric verification failed';
    return { success: false, error: msg };
  }
}

/**
 * Removes enrolled biometric credentials
 */
export function removeBiometrics(): void {
  localStorage.removeItem(BIOMETRIC_CRED_KEY);
  localStorage.removeItem(BIOMETRIC_PAYLOAD_KEY);
  localStorage.removeItem(BIOMETRIC_SALT_KEY);
  triggerHaptic('light');
}
