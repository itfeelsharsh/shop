# KamiKoto - React+Firebase+Cloudflare full stack e-com

admin site features and working showcase video>
[![admin site features and working showcase video](https://img.youtube.com/vi/TbbCTfXJl9E/0.jpg)](https://youtu.be/TbbCTfXJl9E)

https://youtu.be/TbbCTfXJl9E

Welcome to KamiKoto, a beautifully crafted, high-fidelity e-commerce platform offering a seamless shopping experience for premium stationery. This codebase is built with React.js and Firebase, optimized for fluid UI/UX, premium aesthetics, and responsive performance.

## Architecture Overview

KamiKoto operates on a decoupled, serverless e-commerce architecture split across two repositories:

1. Storefront (This Repository): A customer-facing single-page application built using React.js and styled with custom vanilla CSS for high-performance and rich visual design. Hosted on Cloudflare Pages.
2. Admin Dashboard (shopAdmin - Located in `/shopAdmin` directory or hosted in a separate repository): A complete administrative dashboard for managing products, tracking inventory, processing order statuses, and viewing platform analytics.

### Third-Party Integrations
- Database & Auth: Google Firebase (Firestore and Firebase Authentication) handles user accounts, orders, and products.
- Payments: Razorpay handles secure card/UPI/Wallet payments through a Cloudflare Pages serverless function that creates orders and verifies signatures.
- Emails: Resend API powers high-fidelity transactional notifications (order confirmation, packed, shipped, and delivered updates) routed via Cloudflare serverless proxy endpoints.

---

## Getting Started & Installation

### Local Setup

1. Clone the Repository:
   ```bash
   git clone https://github.com/itfeelsharsh/shop.git
   cd shop
   ```

2. Install Dependencies:
   ```bash
   npm install
   ```

3. Setup Local Environment Variables:
   Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
   *Note: .env and .env.local files are explicitly ignored in version control to prevent security leaks.*

4. Run the Storefront Locally:
   ```bash
   npm run dev
   ```

### Admin Panel Setup

1. Navigate to the admin folder:
   ```bash
   cd shopAdmin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Local Environment Variables:
   ```bash
   cp .env.example .env.local
   ```

4. Run the Admin Dashboard Locally:
   ```bash
   npm start
   ```

---

## Environment & Secrets Hardening

To ensure complete privacy and security of your API keys and client credentials, do not commit any secret tokens or private keys to the repository.

### Public Client-Side Variables (.env.local)
- REACT_APP_FIREBASE_API_KEY: Firebase Web API key
- REACT_APP_FIREBASE_AUTH_DOMAIN: Firebase Auth Domain
- REACT_APP_FIREBASE_PROJECT_ID: Firebase Project ID
- REACT_APP_FIREBASE_STORAGE_BUCKET: Firebase Storage Bucket
- REACT_APP_FIREBASE_MESSAGING_SENDER_ID: Firebase Messaging Sender ID
- REACT_APP_FIREBASE_APP_ID: Firebase Web App ID
- REACT_APP_RECAPTCHA_SITE_KEY: Google reCAPTCHA v3 site key

### Private Serverless Variables (Cloudflare Environment Variables)
Configure the following in your Cloudflare Pages dashboard under Settings > Environment Variables:
- FIREBASE_API_KEY: Firebase key used in webhook verification
- FIREBASE_PROJECT_ID: Firebase Project ID
- RAZORPAY_KEY_ID: Razorpay key ID used by the create-order serverless endpoint
- RAZORPAY_KEY_SECRET: Razorpay secret used to verify payment signatures
- REACT_APP_RAZORPAY_KEY_ID: Public Razorpay key exposed to the storefront
- RESEND_API_KEY: Resend private API key (re_...)

---

## Setup Integrations

### 1. Razorpay Payment Integration
Razorpay processes secure card, UPI, and wallet payments via a hosted checkout popup.
- Create a Razorpay account at https://razorpay.com.
- Generate a Key ID and Key Secret from the Razorpay dashboard and configure them as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in your Cloudflare environment variables.
- Add the public key as `REACT_APP_RAZORPAY_KEY_ID` for the storefront.
- The app uses the serverless endpoints under `/functions/api/razorpay/` to create orders and verify signatures after checkout completes.

### 2. Resend Transactional Emails
Emails are automatically sent upon checkout success (Payment Successful) and on order status updates from the admin panel (Packed, Shipped, Delivered).
- Sign up at https://resend.com.
- Create an API key and add it as `RESEND_API_KEY` in your environment variables.
- Add your verified domain (e.g. your-domain.com) in Resend. Transactional emails default to hello@mailer.yourdomain.com.
- **Disabling Emailing:** If you do not wish to use transactional emails or don't have a Resend account, simply leave the `RESEND_API_KEY` unconfigured or set `REACT_APP_EMAIL_ENABLED=false` in your `.env` configuration. The application will gracefully bypass email delivery without breaking checkout or status workflows.

### 3. Domains & Hosting
- **Cloudflare Pages:** We recommend hosting both repositories on Cloudflare Pages. Cloudflare Pages offers free hosting, automatic builds from GitHub, and serverless Functions support (located in `/functions` directory).
- **Custom Domains:** You can use your default Cloudflare `pages.dev` subdomain, or bind a free custom domain. Custom domains can be acquired for free via Digiplat or similar registrars, and added directly to your Cloudflare Pages dashboard.

### 4. Firebase App Check (reCAPTCHA v3)
App Check protects your Firestore database and Authentication services from unauthorized bots and abuse.
- **Register reCAPTCHA v3:** Go to the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin) and create a reCAPTCHA v3 site key for your domains (e.g., `kamikoto.click`).
- **Configure Site Key:** Copy the **Site Key** and add it as `REACT_APP_RECAPTCHA_SITE_KEY` in your `.env.local` or environment configuration.
- **Configure Secret Key:** Copy the **Secret Key** from the reCAPTCHA console, go to **Firebase Console > App Check > Apps**, select your Web App, click **reCAPTCHA v3**, paste the Secret Key, and save.
- **Enforcement:** In the **APIs** tab under App Check, click **Enforce** for Cloud Firestore and Identity Platform (Authentication).
- **Local Development:** When running locally, App Check will print a debug token in your browser's Developer Tools Console. Copy that token and add it under the Web App's **Manage debug tokens** settings in the Firebase Console to bypass verification while developing.

---

## Firebase Configuration & Role Escalation

1. Go to Firebase Console (https://console.firebase.google.com) and enable Firestore and Authentication.
2. Apply the rules present in `firestore.rules.txt` to your database.
3. To promote a user account to Admin:
   - Register the user via the storefront signup flow.
   - Go to your Firestore Console, locate the user's document in the `users` collection, and add a string field:
     ```plaintext
     userRole : Admin
     ```
   - This user now has full permissions to manage products, view customers, and update order statuses in the shopAdmin interface.
