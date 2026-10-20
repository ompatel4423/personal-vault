# Personal Vault • iPhone 15 Pro Encrypted Wallet

A personal identity and financial wallet app crafted specifically for **iPhone 15 Pro** with **Dynamic Island integration**, **120Hz ProMotion smoothness**, **ThreeUI shader aesthetics**, and **WebCrypto AES-256-GCM zero-knowledge encryption**.

---

## 📱 Documents & Cards Supported
1. **Indian Passport** (ICAO compliant, passport number, expiry, place of issue).
2. **Aadhaar Card** (UIDAI 12-digit UID with 4-4-4 grouping, unmask toggle, address).
3. **PAN Card** (Permanent Account Number, ITD emblem, father's name, DOB).
4. **Driving Licence** (DL Number, vehicle categories MCWG/LMV, RTO authority, blood group).
5. **Voter ID / EPIC** (Election Commission of India, assembly constituency, polling station).
6. **Bank Credit & Debit Cards** (HDFC Millennia, SBI RuPay; EMV chip, 3D flip to back for CVV, 1-tap copy).
7. **Metro / Transit Card** (National Common Mobility Card; interactive Tap Station simulator & balance top-up).
8. **School Marksheets** (CBSE Class X / XII & Degree certificates, marks, roll number, DigiLocker verified badge).
9. **Passport Size Photo** (Standard 35mm x 45mm white background studio preview).
10. **Official Specimen Signature** (Interactive finger/stylus signature drawing canvas with SVG/PNG vector save).
11. **Custom Documents** (Add any custom card or credential with customizable fields).

---

## 🔒 Security Architecture: Google Sheets vs. Local-First Encrypted PWA

### Why Google Sheets is a Severe Risk for Sensitive Documents:
* **Plaintext Exposure**: Google Sheets stores cell values in plaintext on Google servers. Anyone with sheet access or an intercepted API key/service token can read your Aadhaar, PAN, and Bank Card numbers.
* **No Client-Side Encryption**: Google Sheets does not provide end-to-end zero-knowledge encryption.
* **Truncation & Storage Limits**: Google Sheets limits cells to 50,000 characters, corrupting base64 image scans and documents.
* **Regulatory Compliance**: Storing biometric-linked identity data (Aadhaar UID) or financial card CVVs unencrypted in public clouds violates security best practices.

### The Solution Built in this App:
* **Client-Side Zero-Knowledge Encryption**: Uses native **WebCrypto AES-256-GCM** with a **PBKDF2 SHA-256 key derivation** (100,000 iterations).
* **On-Device Storage**: Your documents remain inside your iPhone 15 Pro's encrypted local storage.
* **Encrypted Backups**: Single-click export of `.vault` encrypted files to your private iCloud Drive or Google Drive (the file itself is encrypted with your Master PIN before leaving your phone).
* **PIN & Face ID Authentication**: Tactile numeric PIN pad + Face ID simulation.

---

## 🏝️ iPhone 15 Pro Hardware Optimizations
* **Dynamic Island HUD**: Realistic iPhone 15 Pro top cutout simulation that expands dynamically when copying details, flipping cards, tapping metro stations, or unlocking with Face ID.
* **ProMotion 120Hz**: Hardware-accelerated CSS spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`) and WebGL requestAnimationFrame loop.
* **Haptic Touch**: Web Vibration API feedback on keypad clicks, card flips, and copy actions.
* **PWA Standalone Mode**: Configured with `viewport-fit=cover`, `apple-mobile-web-app-status-bar-style: black-translucent`, and safe-area insets (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).

---

## 🎨 ThreeUI Shader Integration
* **CRT Terminal Mode**: WebGL scanlines using `<CrtBackground variant="terminal" ... />` from `@designcodeio/threeui`.
* **Fluid Koi Studies**: Organic ripple simulation using `<KoiStudies />` from `@designcodeio/threeui`.
* **Plasma Action Buttons**: Tactile button responses using `<ShaderButtons variant="plasma-button" ... />` from `@designcodeio/threeui`.
* **Stealth OLED**: Pure `#050508` pitch black for maximum power savings on Super Retina XDR OLED displays.

---

## 🚀 Running & Deploying

### 1. Local Development
```bash
cd personal-vault
npm install
npm run dev
```

### 2. Deploying to Netlify (Recommended)
1. Push this folder to a GitHub repository.
2. In Netlify, click **"Add new site" > "Import an existing project"**.
3. Select your repository. Netlify will auto-detect `netlify.toml` with:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy! Your app will be live on a fast, free HTTPS domain (e.g., `https://my-vault.netlify.app`).

### 3. Installing on iPhone 15 Pro
1. Open your Netlify URL in **Safari** on your iPhone 15 Pro.
2. Tap the **Share** button (box with upward arrow) at the bottom.
3. Tap **"Add to Home Screen"**.
4. Tap **"Add"**. The app will now launch full-screen like a native iOS app without any Safari browser bars!
