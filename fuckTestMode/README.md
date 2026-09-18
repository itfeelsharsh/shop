# Razorpay Test Mode Ribbon Remover

A local Google Chrome extension (Manifest V3) that permanently and completely removes the Razorpay **"Test Mode"** top-right red diagonal ribbon badge with zero visual flicker.

---

## ⚡ How It Works

1. **Zero-Flicker CSS Injection (`content.css`)**:
   - Injected at `document_start` across all frames and URLs.
   - Suppresses the ribbon before the browser can even paint the first frame.
2. **Real-time DOM Removal (`content.js`)**:
   - Actively monitors the DOM via `MutationObserver`.
   - The instant Razorpay's `checkout.js` creates `.razorpay-backdrop` or appends the ribbon element, it is immediately deleted from the DOM.
3. **Modal Remains 100% Functional**:
   - The payment modal (`iframe.razorpay-checkout-frame`) and payment flow remain completely intact and functional.
4. **Popup Controls (`popup.html`)**:
   - Toggle the remover ON / OFF at any time.
   - Option to also make the dark backdrop overlay transparent if desired.
   - Real-time counter of removed ribbons on the active tab.

---

## 🚀 How to Install in Google Chrome

1. Open Google Chrome and navigate to:
   ```
   chrome://extensions/
   ```
2. In the top-right corner of the Extensions page, enable **"Developer mode"** (toggle switch).
3. Click the **"Load unpacked"** button in the top-left.
4. Select this folder:
   ```
   C:\Users\harsh\Desktop\fuckTestMode
   ```
5. *(Optional - for local files)*:
   If you want the extension to work on local HTML files (such as `1.html`):
   - Find **"Razorpay Test Mode Ribbon Remover"** in your extensions list.
   - Click **Details**.
   - Scroll down and enable **"Allow access to file URLs"**.

---

## 🧪 Testing

1. Open `1.html` in Chrome or visit any site integrating Razorpay in Test Mode.
2. The red diagonal **"Test Mode"** ribbon in the top right will be completely gone!
3. Click the extension icon in your Chrome toolbar to view status and toggle options.
