import React from 'react';
import { m } from "framer-motion";
import { Helmet } from 'react-helmet-async';

function ShippingInfo() {
  return (
    <m.div
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeInOut" }} 
      className="container mx-auto px-4 py-12 max-w-4xl"
    >
      <Helmet>
        <title>Shipping Information | KamiKoto</title>
        <meta name="description" content="Learn about my shipping rates, methods, and delivery times." />
      </Helmet>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-gray-900 text-center">Shipping Information</h1>
        
        <p className="text-lg text-gray-700 mb-8 leading-relaxed text-center">
          At <strong className="font-extrabold text-cyan-600">KamiKoto</strong>, I strive to deliver your premium items safely and efficiently. Below is everything you need to know about my shipping rates, delivery timelines, and methods.
        </p>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">1. Processing Times</h2>
        <p className="text-base text-gray-600 mb-6 leading-relaxed">
          Orders are typically processed and prepared for shipping within <strong>1 to 2 business days</strong> (excluding weekends and public holidays). You will receive an email confirmation containing tracking information once your package has been handed over to my courier partner.
        </p>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">2. Shipping Rates & Delivery Estimates</h2>
        <p className="text-base text-gray-600 mb-6 leading-relaxed">
          I offer free standard shipping across India on all premium orders above ₹500. For orders under ₹500, a flat-rate shipping fee will be calculated at checkout.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-sm text-gray-600 border border-gray-100 rounded-xl overflow-hidden">
            <thead className="bg-gray-50 text-gray-900 font-bold">
              <tr>
                <th className="p-4">Shipping Option</th>
                <th className="p-4">Delivery Time</th>
                <th className="p-4">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-4 font-semibold">Standard Shipping</td>
                <td className="p-4">3 - 5 Business Days</td>
                <td className="p-4">Free (on orders &gt; ₹500) / ₹50 flat rate</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Express Shipping</td>
                <td className="p-4">1 - 2 Business Days</td>
                <td className="p-4">₹120 flat rate</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">3. Delivery Tracking</h2>
        <p className="text-base text-gray-600 mb-6 leading-relaxed">
          Once your package ships, I will email you a tracking link. You can use this link to check the status of your parcel directly on my shipping carrier's website. Please allow 24 hours for the tracking information to update after receiving your shipping confirmation.
        </p>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">4. Damaged or Lost Shipments</h2>
        <p className="text-base text-gray-600 mb-6 leading-relaxed">
          If your package arrives damaged, or if it is lost in transit, please contact my support team immediately. I will initiate an inquiry with the courier and send you a replacement shipment as quickly as possible.
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

export default ShippingInfo;
