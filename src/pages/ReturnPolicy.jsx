import React from 'react';
import { m } from "framer-motion";
import { Helmet } from 'react-helmet-async';

function ReturnPolicy() {
  return (
    <m.div
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeInOut" }} 
      className="container mx-auto px-4 py-12 max-w-4xl"
    >
      <Helmet>
        <title>Return Policy | KamiKoto</title>
        <meta name="description" content="My transparent return and refund policy." />
      </Helmet>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-gray-900 text-center">Return Policy</h1>
        
        <p className="text-lg text-gray-700 mb-8 leading-relaxed text-center">
          At <strong className="font-extrabold text-cyan-600">KamiKoto</strong>, I stand behind the quality of my premium goods. If you are not completely satisfied with your purchase, I am here to help.
        </p>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">1. Returns & Exchanges</h2>
        <p className="text-base text-gray-600 mb-6 leading-relaxed">
          You have <strong>7 days</strong> from the date of delivery to request a return or exchange for any product purchased from my store. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging.
        </p>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">2. Refunds</h2>
        <p className="text-base text-gray-600 mb-6 leading-relaxed">
          Once I receive and inspect your returned item, I will send you an email notification confirming receipt. If approved, your refund will be processed and automatically applied to your original method of payment within 5-7 business days.
        </p>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">3. Non-Returnable Items</h2>
        <p className="text-base text-gray-600 mb-6 leading-relaxed">
          Please note that certain items are not eligible for returns or refunds, including:
        </p>
        <ul className="list-disc list-inside text-base text-gray-600 mb-6 space-y-2">
          <li>Customized or personalized items</li>
          <li>Gift cards and digital voucher purchases</li>
          <li>Items marked as final sale or clearance</li>
        </ul>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">4. Shipping Cost for Returns</h2>
        <p className="text-base text-gray-600 mb-6 leading-relaxed">
          You will be responsible for paying the shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund amount.
        </p>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">5. Demo Store Disclaimer</h2>
        <p className="text-base text-gray-600 mb-6 leading-relaxed font-medium italic">
          Please note: KamiKoto is a student portfolio concept demonstration site. No actual products are sold, and no real transactions, shipments, or returns take place.
        </p>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-500">
            Have questions about your order? Feel free to contact me on my <a href="/contact" className="text-cyan-600 hover:text-cyan-700 font-bold underline">Contact Page</a>.
          </p>
        </div>
      </div>
    </m.div>
  );
}

export default ReturnPolicy;
