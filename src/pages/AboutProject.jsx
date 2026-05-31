import React, { useState } from 'react';
import { m } from "framer-motion";

/**
 * AboutProject page component displaying the complete technical documentation
 * and developer guide for the KamiKoto e-commerce architecture.
 * Updated to use a light-themed design matching the storefront.
 */
function AboutProject() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', name: '1. Project Overview' },
    { id: 'architecture', name: '2. System Architecture' },
    { id: 'storefront', name: '3. Storefront Frontend' },
    { id: 'admin', name: '4. Admin Dashboard' },
    { id: 'database', name: '5. Database & Security' },
    { id: 'functions', name: '6. Serverless Backend' },
    { id: 'checkout-flow', name: '7. Payment Flow' },
    { id: 'dx-tips', name: '8. DX & Dev Tips' }
  ];

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 text-gray-800 font-sans antialiased"
    >
      {/* Tech Docs Top Banner */}
      <header className="bg-white border-b border-gray-200 py-8 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded border border-indigo-150">Developer Guide</span>
              <span className="text-gray-400 text-xs font-mono">v1.2.0-serverless</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-2">Storefront & Admin Technical Manual</h1>
            <p className="text-gray-500 text-sm mt-1">
              Architecture guide and code documentation for storefront frontend and admin dashboard.
            </p>
          </div>
          <a
            href="https://github.com/itfeelsharsh/shop"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-mono border border-gray-300 shadow-sm transition-all flex items-center gap-2"
          >
            <span>📄 github/shop</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Index Links (Desktop Only) */}
        <aside className="hidden lg:block lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-1">
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">Manual Sections</h3>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all border-l-2 ${
                  activeSection === section.id
                    ? 'bg-indigo-50/50 text-indigo-700 border-indigo-650 font-bold'
                    : 'text-gray-500 hover:text-gray-800 border-transparent hover:bg-gray-100'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Section */}
        <main className="flex-1 space-y-10 pb-24">
          
          {/* 1. Project Overview */}
          <section id="overview" className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3">1. Project Overview</h2>
            <p className="text-gray-655 text-sm sm:text-base leading-relaxed">
              KamiKoto is a full-stack, serverless e-commerce platform built to sell premium goods. 
              The main design goal is high developer experience (DX) and zero hosting overhead cost. 
              I achieve this by decoupling the client storefront from the admin dashboard and running everything serverless; 
              using Cloudflare Pages and Firebase databases.
            </p>
            <p className="text-gray-655 text-sm sm:text-base leading-relaxed">
              By using client side rendering (React) with Google Firebase Firestore, I do not require a dedicated 
              backend database server, this saves hosting money and makes the website extremely fast. I also use 
              Cloudflare serverless Pages functions to do private database updates, process Razorpay payments, 
              and send emails securely without exposing keys to clients.
            </p>

            {/* Admin Portal Showcase Video Embed */}
            <div className="space-y-3 mt-6 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold font-mono text-gray-800">Admin Portal Showcase Video</h3>
              <p className="text-xs text-gray-500">
                You can watch this video to see the admin portal dashboard working and how products or orders are managed.
              </p>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md border border-gray-250 bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/TbbCTfXJl9E"
                  title="Shop Admin Portal Showcase"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </section>

          {/* 2. System Architecture */}
          <section id="architecture" className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3">2. System Architecture</h2>
            <p className="text-gray-655 text-sm leading-relaxed">
              I have two separate projects which run on their own codebases storefront and admin panel. Below is 
              the structural layout of how the files are organised in the frontend repository:
            </p>

            <pre className="bg-gray-900 p-4 rounded-xl border border-gray-800 font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre">
              {`shop (Storefront Frontend Repo)
├── functions/                     <-- Cloudflare Pages serverless functions
│   ├── _middleware.js             <-- Global security headers & CORS policies
│   ├── api/
│   │   ├── razorpay/
│   │   │   ├── create-order.js    <-- Razorpay order initiation API
│   │   │   └── verify-payment.js  <-- Payment HMAC check & direct Firestore REST write
│   │   ├── send-email.js          <-- Transactional mail sender using Resend API
│   │   └── send-notification.js   <-- FCM push notification campaign manager
├── public/                        <-- Static public assets, logo files and HTML templates
└── src/                           <-- React client application codebase
    ├── components/                <-- Reusable UI elements (Navbar, Loaders, Buttons)
    ├── firebase/                  <-- SDK configuration and Web App startup
    ├── hooks/                     <-- Custom React hooks for loader state, auth etc.
    ├── pages/                     <-- Primary page views (Home, Products, Checkout)
    ├── redux/                     <-- Redux Toolkit slice store (Cart state, Auth data)
    └── utils/                     <-- Logger utilities and general helpers`}
            </pre>

            <p className="text-gray-650 text-sm leading-relaxed mt-4">
              And here is the structure of the admin portal codebase, which is located in a separate directory or repository:
            </p>

            <pre className="bg-gray-900 p-4 rounded-xl border border-gray-800 font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre">
              {`shopAdmin (Admin Portal Control Dashboard)
├── src/
│   ├── components/                <-- Polaris-style UI widgets (Spinners, Alert bars)
│   ├── contexts/                  <-- React contexts for session authentication
│   ├── pages/
│   │   ├── AdminHome.js           <-- Dashboard home showing Sales analytics
│   │   ├── Orders.js              <-- Detailed Order dispatch tracking table
│   │   ├── Products.js            <-- Product list dashboard with stocks
│   │   ├── Users.js               <-- Customer accounts view & role manager
│   │   ├── ProductManagement/     <-- Editor to Add/Modify catalog entries
│   │   ├── CouponManagement/      <-- Manage active discount coupons
│   │   ├── BannerManagement/      <-- Admin settings for slideshow slides
│   │   └── Notifications.js       <-- Firebase Push notification sender UI
│   └── utils/                     <-- Order calculating math & formatting helpers`}
            </pre>
          </section>

          {/* 3. Storefront Frontend */}
          <section id="storefront" className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3">3. Storefront Frontend</h2>
            <p className="text-gray-650 text-sm leading-relaxed">
              The storefront is a client-side Single Page Application (SPA). It uses React 18, React Router Dom v6 for 
              routing, and Tailwind CSS for utility styles.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                <h4 className="font-mono text-xs text-gray-900 font-bold">State Management</h4>
                <p className="text-xs text-gray-655 leading-relaxed">
                  I use Redux Toolkit to handle client side states, primarily for cart items. This helps me to synchronise 
                  added items, calculate discounts instantly and update the cart badge counts in Navbar.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                <h4 className="font-mono text-xs text-gray-900 font-bold">Assets & responsivness</h4>
                <p className="text-xs text-gray-655 leading-relaxed">
                  Storefront design works on fluid mobile-first layouts. Custom media queries help build top navbar 
                  for big screens and bottom navigation bars for smartphones, which improves responsivness and speed.
                </p>
              </div>
            </div>

            <p className="text-gray-655 text-sm leading-relaxed mt-2">
              To make page transitions very slick I use Framer Motion. This makes the UI feel smooth, and 
              premium without writing long CSS keyframe styles.
            </p>
          </section>

          {/* 4. Admin Dashboard */}
          <section id="admin" className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3">4. Admin Dashboard</h2>
            <p className="text-gray-650 text-sm leading-relaxed">
              The admin panel (`shopAdmin`) is designed like a Shopify Polaris console. It has a modern dark side navigation 
              bar and a light dashboard body, which displays analytics.
            </p>
            <p className="text-gray-650 text-sm leading-relaxed">
              The dashboard queries the global Firestore collection for orders and calculates:
            </p>

            <table className="w-full text-left text-xs border-collapse border border-gray-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 border border-gray-200">Analytics Parameter</th>
                  <th className="p-3 border border-gray-200">Calculation Method</th>
                  <th className="p-3 border border-gray-200">Firestore Query Strategy</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 bg-white">
                <tr className="border-b border-gray-200">
                  <td className="p-3 border border-gray-200 font-mono text-gray-900">Gross Sales</td>
                  <td className="p-3 border border-gray-200">Sum of (item price × quantity) of all orders</td>
                  <td className="p-3 border border-gray-200">Parallel query reads latest 150 items to minimize reads.</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3 border border-gray-200 font-mono text-gray-900">Monthly Trend</td>
                  <td className="p-3 border border-gray-200">Revenue grouped by calendar month</td>
                  <td className="p-3 border border-gray-200">Aggregated client-side into last 6 months buckets.</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3 border border-gray-200 font-mono text-gray-900">Fulfilment Rate</td>
                  <td className="p-3 border border-gray-200">Count of orders by status (Placed, Shipped, Delivered)</td>
                  <td className="p-3 border border-gray-200">Recharts Pie chart represents the relative percentage.</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 5. Database & Security */}
          <section id="database" className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3">5. Database & Security</h2>
            <p className="text-gray-655 text-sm leading-relaxed">
              Firestore does not have typical tables, instead it uses collections and documents. The core collections 
              registered in my system are `users`, `products`, `orders`, `coupons`, `settings`, `announcements`, 
              `banners`, and `reviews`.
            </p>
            <p className="text-gray-655 text-sm leading-relaxed">
              To secure the database, I wrote strict security rules in `firebase.rules.txt`. These prevent non-authorized 
              actions and verify roles. Below is the explanation of the major rules:
            </p>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <h4 className="font-mono text-xs text-gray-900 font-bold">Admin Verification Rule</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                When a request is sent, the rule calls `get()` on the `users` collection to check the request user's document. 
                If the `userRole` property inside matches `Admin`, only then the write is permitted.
              </p>
              <pre className="text-[10px] text-indigo-300 font-mono bg-gray-900 p-2.5 rounded border border-gray-800 overflow-x-auto">
{`function isAdmin() {
  return request.auth != null &&
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userRole == 'Admin';
}`}
              </pre>
            </div>

            <p className="text-gray-655 text-sm leading-relaxed">
              I also have a custom rules check called `hasPurchasedAndReceivedProduct()`. This ensures that a user can 
              only create reviews if they have purchased that product and the status of order is set as "Delivered". 
              For regular users checkout, I also allow updating only the `stock` and `lastSold` fields inside the `products` 
              collection so they cannot edit details like base price of items.
            </p>
          </section>

          {/* 6. Serverless Backend */}
          <section id="functions" className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3">6. Serverless Backend</h2>
            <p className="text-gray-655 text-sm leading-relaxed">
              Since I deploy the storefront on Cloudflare Pages, I have serverless functions inside `functions/api`. 
              This acts as my backend.
            </p>

            <div className="space-y-4">
              {/* Send Email Function */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">POST</span>
                  <span className="font-mono text-xs text-gray-900 font-bold">/api/send-email</span>
                </div>
                <p className="text-xs text-gray-655 leading-relaxed">
                  Acts as a server-side proxy to trigger Resend API email notification pipeline. By keeping the call in 
                  this serverless function I prevent CORS blockages; and keep the private key `RESEND_API_KEY` hidden 
                  from browser client bundles. It handles order success letters and shipment updates.
                </p>
              </div>

              {/* FCM Notification Function */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">POST</span>
                  <span className="font-mono text-xs text-gray-900 font-bold">/api/send-notification</span>
                </div>
                <p className="text-xs text-gray-650 leading-relaxed">
                  Allows admin to send push notifications via Firebase Cloud Messaging. Instead of packing heavy Google Auth 
                  SDKs, it signs OAuth JWTs using standard Web Crypto API algorithms (`RSASSA-PKCS1-v1_5` with PKCS8 format 
                  private key) and fetches authentication tokens directly. This is super light-weight.
                </p>
              </div>

              {/* Razorpay create order */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">POST</span>
                  <span className="font-mono text-xs text-gray-900 font-bold">/api/razorpay/create-order</span>
                </div>
                <p className="text-xs text-gray-655 leading-relaxed">
                  Initiates a Razorpay order from the REST API by encoding credentials via Basic Auth. It calculates 
                  the amount in paise (1 INR = 100 paise) and returns the verified `orderId` and public `keyId` to 
                  the storefront checkout module.
                </p>
              </div>

              {/* Razorpay verify payment */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">POST</span>
                  <span className="font-mono text-xs text-gray-900 font-bold">/api/razorpay/verify-payment</span>
                </div>
                <p className="text-xs text-gray-650 leading-relaxed">
                  Verifies checkout signature returned by Razorpay popup. It computes expected HMAC SHA-256 using 
                  the Web Crypto API on Cloudflare and compares it with the client-submitted signature. If they match, 
                  it updates the global order in Firestore to `Paid` status using Google's direct REST API.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Payment Flow */}
          <section id="checkout-flow" className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3">7. Payment Flow</h2>
            <p className="text-gray-655 text-sm leading-relaxed">
              Below sequence explains step-by-step how a checkout payment works in my decoupled architecture:
            </p>

            <div className="bg-gray-55 p-5 rounded-2xl border border-gray-200 font-mono text-xs text-gray-700 space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-gray-200 text-gray-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0">1</span>
                <div>
                  <span className="text-gray-900 font-bold">Checkout Page Trigger:</span> User fills details and clicks buy. The client calls `/api/razorpay/create-order` passing total amount.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gray-200 text-gray-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0">2</span>
                <div>
                  <span className="text-gray-900 font-bold">Razorpay Registration:</span> Serverless API contacts Razorpay, gets official Order ID and sends back to client.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gray-200 text-gray-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0">3</span>
                <div>
                  <span className="text-gray-900 font-bold">Razorpay Popup Checkout:</span> Client opens Razorpay iframe, user fills credentials and completes transaction.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gray-200 text-gray-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0">4</span>
                <div>
                  <span className="text-gray-900 font-bold">HMAC Signature check:</span> Client sends signature details to `/api/razorpay/verify-payment`. The function verifies signature, then calls Firestore REST patch API to set order payment status as Paid.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gray-200 text-gray-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0">5</span>
                <div>
                  <span className="text-gray-900 font-bold">Resend notification pipeline:</span> On verification success, front-end triggers email proxy which triggers Resend, sending order details straight to customer mail inbox.
                </div>
              </div>
            </div>
          </section>

          {/* 8. DX & Dev Tips */}
          <section id="dx-tips" className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3">8. DX & Dev Tips</h2>
            <p className="text-gray-655 text-sm leading-relaxed">
              I have integrated nice DX items to make building and debugging smooth:
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-mono text-xs text-gray-900 font-bold mb-1">🔧 Keyboard Shortcut Loader Bypass</h4>
                <p className="text-xs text-gray-650 leading-relaxed">
                  During development, wait for auth check can be slow. You can press <kbd className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[10px] border border-gray-300">Ctrl + Shift + L</kbd> on storefront to force close loading screen and bypass preloader immediately. This works only on local development environment to speed up UI tests.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-mono text-xs text-gray-900 font-bold mb-1">🛠 Firestore REST API Usage</h4>
                <p className="text-xs text-gray-655 leading-relaxed">
                  To avoid loading huge firebase-admin SDKs into Cloudflare pages worker context (which increases worker 
                  bundle size and latency), I use simple fetch calls to interact with firestore REST endpoints. This 
                  makes workers load under 5ms, which is very good.
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </m.div>
  );
}

export default AboutProject;
