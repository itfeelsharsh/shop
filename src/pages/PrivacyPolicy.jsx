
import React from 'react';
import { m } from "framer-motion";


function PrivacyPolicy() {
  return (
    <m.div
    initial={{ opacity: 0, y: 50 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.6, ease: "easeInOut" }} 
    className="container mx-auto px-4 py-8 bg-gray-50"
  >
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold mb-8 text-gray-900 text-center">Privacy Policy</h1>
      
      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        Welcome to <strong className="text-indigo-600">KamiKoto</strong>! Your privacy is of utmost importance to us. This Privacy Policy outlines the types of information we do and do not collect, how we use it, and the measures we take to protect your privacy.
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">1. Information We Do Not Collect</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        <strong>KamiKoto</strong> is designed solely for educational purposes. We do not collect, store, or process any personal data from our users. This includes, but is not limited to:
      </p>
      <ul className="list-disc list-inside text-lg text-gray-700 mb-4">
        <li>Personal Identification Information (e.g., name, address, email)</li>
        <li>Payment Information</li>
        <li>Browsing History</li>
        <li>Location Data</li>
      </ul>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">2. Use of Third-Party Services</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        Our application utilizes third-party services such as Firebase and React Router for functionality and navigation. These services may have their own privacy policies governing the use of your data. We encourage you to review their respective policies to understand how your information is handled.
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">3. Cookies and Tracking Technologies</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        <strong>KamiKoto</strong> does not use cookies or any other tracking technologies to monitor or store your activity.
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">4. Changes to This Privacy Policy</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">5. Contact Us</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        If you have any questions or concerns about this Privacy Policy, please feel free to reach out to us through our <a href="/contact" className="text-blue-500 underline">Contact Us</a> page.
      </p>
    </div>
    </m.div>

  );
}

export default PrivacyPolicy;
