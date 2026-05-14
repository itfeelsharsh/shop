
import React from 'react';
import { m } from "framer-motion";
import { Helmet } from 'react-helmet-async';

function ReturnPolicy() {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50 py-16 px-4"
    >
      <Helmet>
        <title>Return Policy | KamiKoto</title>
        <meta name="description" content="Our transparent, zero-hassle (because zero-product) return policy." />
      </Helmet>

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
        <h1 className="text-5xl font-black mb-8 text-gray-900 tracking-tighter">
          Return Policy<span className="text-gray-400">.</span>
        </h1>

        <div className="prose prose-lg prose-indigo">
          <p className="text-xl text-gray-600 mb-8 leading-relaxed italic">
            "We don't take back what was never sent." — The KamiKoto Logistics Team.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. The Absolute Truth</h2>
            <p className="text-gray-700 leading-relaxed">
              KamiKoto is a high-fidelity demonstration project. We do not sell physical goods, and as such, we do not have a physical warehouse to receive returns. If you are attempting to return an item, please verify that you are not currently dreaming or experiencing a glitch in the simulation.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility for Returns</h2>
            <p className="text-gray-700 leading-relaxed">
              Since no actual currency is exchanged and no physical parcel is dispatched, the following items are eligible for return:
            </p>
            <ul className="list-disc pl-6 mt-4 text-gray-700 space-y-2">
              <li>Imaginary defects in virtual stationery.</li>
              <li>Emotional dissatisfaction with a test transaction.</li>
              <li>Digital dust on your browser window.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Process</h2>
            <p className="text-gray-700 leading-relaxed">
              Refunds are processed at the speed of your internet connection. Since you weren't actually charged, the refund will appear in your bank account exactly as it was before you "bought" something here: <strong>untouched.</strong>
            </p>
          </section>

          <section className="mb-10 text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Legal Disclaimer</h2>
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Anti-Lawsuit Protocol v2.0</p>
            <p className="mt-4 text-gray-600 italic">
              By reading this, you acknowledge that KamiKoto is a portfolio piece. Any attempt to sue for a missing notebook will result in our legal team sending you a very nice PDF of a handwritten "No."
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500">
              Questions? <a href="/contact" className="text-gray-900 font-bold underline underline-offset-4">Contact Us</a> (we actually respond there).
            </p>
          </div>
        </div>
      </div>
    </m.div>
  );
}

export default ReturnPolicy;
