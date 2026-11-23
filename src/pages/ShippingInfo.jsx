import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import InfoPageLayout from '../components/InfoPageLayout';

function ShippingInfo() {
  return (
    <>
      <Helmet>
        <title>Shipping Information | KamiKoto</title>
        <meta name="description" content="Shipping options, delivery timelines, and rates at KamiKoto." />
      </Helmet>

      <InfoPageLayout
        category="Support"
        title="Shipping Information"
        description="Everything you need to know about processing times, delivery options, and tracking your order."
      >
        <h2>1. Processing Times</h2>
        <p>
          Orders are typically processed and prepared for shipping within <strong>1 to 2 business days</strong> (excluding weekends and public holidays). You will receive an email confirmation containing tracking information once your package has been handed over to the courier.
        </p>

        <h2>2. Shipping Rates &amp; Delivery Estimates</h2>
        <p>
          Standard shipping across India is free on orders above ₹500. For orders under ₹500, a flat-rate shipping fee is calculated at checkout.
        </p>
        <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[560px] text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Shipping option</th>
                <th className="px-4 py-3">Delivery time</th>
                <th className="px-4 py-3">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3.5 font-medium text-gray-900">Standard Shipping</td>
                <td className="px-4 py-3.5">3–5 business days</td>
                <td className="px-4 py-3.5">Free (orders &gt; ₹500) / ₹50 flat rate</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-medium text-gray-900">Express Shipping</td>
                <td className="px-4 py-3.5">1–2 business days</td>
                <td className="px-4 py-3.5">₹120 flat rate</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>3. Delivery Tracking</h2>
        <p>
          Once your package ships, we will email you a tracking link. Please allow 24 hours for tracking information to update after receiving your shipping confirmation.
        </p>

        <h2>4. Damaged or Lost Shipments</h2>
        <p>
          If your package arrives damaged, or if it is lost in transit, please contact support so we can look into the shipment.
        </p>

        <div className="mt-8 rounded-xl border border-red-100 bg-red-50/50 p-5">
          <p className="mb-0">
            KamiKoto is a student portfolio concept demonstration site. No actual products are sold, and no real transactions, shipments, or returns take place.
          </p>
          <p className="mb-0 mt-3">
            Have a question? Visit our <Link to="/contact">Contact Us</Link> page.
          </p>
        </div>
      </InfoPageLayout>
    </>
  );
}

export default ShippingInfo;
