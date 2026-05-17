# KamiKoto - Luxury Stationery E-Commerce Platform

Welcome to KamiKoto, a beautifully crafted, high-fidelity e-commerce platform offering a seamless shopping experience for premium stationery. This codebase is built with React.js and Firebase, optimized for fluid UI/UX, premium aesthetics, and responsive performance.

## Architecture Overview

KamiKoto operates on a decoupled, serverless e-commerce architecture split across two repositories:

1. Storefront (This Repository): A customer-facing single-page application built using React.js and styled with custom vanilla CSS for high-performance and rich visual design. Hosted on Cloudflare Pages.
2. Admin Dashboard (shopAdmin - Located in `/shopAdmin` directory or hosted in a separate repository): A complete administrative dashboard for managing products, tracking inventory, processing order statuses, and viewing platform analytics.

### Third-Party Integrations
- Database & Auth: Google Firebase (Firestore and Firebase Authentication) handles user accounts, orders, and products.
- Payments: Stripe Checkout handles secure card payments. A Cloudflare Pages serverless function processes secure checkout sessions and webhook verification.
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
- STRIPE_SECRET_KEY: Stripe private API key (sk_test_... or sk_live_...)
- STRIPE_WEBHOOK_SECRET: Stripe webhook signature secret (whsec_...)
- RESEND_API_KEY: Resend private API key (re_...)

---

## Setup Integrations

### 1. Stripe Payment Integration
Stripe processes all payments securely via hosted Stripe Checkout pages.
- Create a Stripe Account at https://stripe.com.
- Get your Secret API key from your dashboard and configure it as `STRIPE_SECRET_KEY` in your Cloudflare environment variables.
- Set up a webhook in Stripe Dashboard pointing to: `https://your-domain.com/api/stripe-webhook`.
- Subscribe to the `checkout.session.completed` event.
- Get the webhook secret and add it as `STRIPE_WEBHOOK_SECRET`.

### 2. Resend Transactional Emails
Emails are automatically sent upon checkout success (Payment Successful) and on order status updates from the admin panel (Packed, Shipped, Delivered).
- Sign up at https://resend.com.
- Create an API key and add it as `RESEND_API_KEY` in your environment variables.
- Add your verified domain (e.g. your-domain.com) in Resend. Transactional emails default to hello@mailer.yourdomain.com.
- **Disabling Emailing:** If you do not wish to use transactional emails or don't have a Resend account, simply leave the `RESEND_API_KEY` unconfigured or set `REACT_APP_EMAIL_ENABLED=false` in your `.env` configuration. The application will gracefully bypass email delivery without breaking checkout or status workflows.

### 3. Domains & Hosting
- **Cloudflare Pages:** We recommend hosting both repositories on Cloudflare Pages. Cloudflare Pages offers free hosting, automatic builds from GitHub, and serverless Functions support (located in `/functions` directory).
- **Custom Domains:** You can use your default Cloudflare `pages.dev` subdomain, or bind a free custom domain. Custom domains can be acquired for free via Digiplat or similar registrars, and added directly to your Cloudflare Pages dashboard.

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