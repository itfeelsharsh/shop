
import React from 'react';
import { m } from "framer-motion";


function TermsOfService() {
  return (
    <m.div
    initial={{ opacity: 0, y: 50 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.6, ease: "easeInOut" }} 
    className="container mx-auto px-4 py-8 bg-gray-50"
  >
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold mb-8 text-gray-900 text-center">Terms of Service</h1>
      
      <p className="text-lg text-gray-700 mb-6 leading-relaxed text-center">
        Welcome to <strong className="text-indigo-600">KamiKoto</strong>! By accessing or using our application, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">1. Acceptance of Terms</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        These Terms of Service govern your use of the <strong>KamiKoto</strong> application. By using our app, you accept these terms in full. If you disagree with any part of these terms, you must not use our application.
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">2. Purpose of the Application</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        <strong>KamiKoto</strong> is developed exclusively for educational purposes. It serves as a demonstration of React and Firebase integration in building a Japanese stationery shopping application.
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">3. No Data Collection</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        We do not collect, store, or process any personal information from users. As a result, there are no user accounts, payment processing, or data storage mechanisms in place.
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">4. Intellectual Property</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        All content, including text, images, logos, and software, is the property of <strong>KamiKoto</strong> or its respective owners. Unauthorized use or reproduction of any materials is strictly prohibited.
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">5. Limitation of Liability</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        <strong>KamiKoto</strong> is provided "as is" without any warranties, express or implied. We are not liable for any damages arising from the use or inability to use our application.
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">6. Changes to Terms</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        We reserve the right to modify these Terms of Service at any time. Any changes will be effective immediately upon posting on this page. Your continued use of the application constitutes acceptance of the revised terms.
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">7. Governing Law</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        These terms are governed by and construed in accordance with the laws of [Your Jurisdiction]. Any disputes arising from these terms shall be resolved in the courts of [Your Jurisdiction].
      </p>
      
      <h2 className="text-3xl font-semibold mb-4 text-gray-800">8. Contact Us</h2>
      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
        If you have any questions about these Terms of Service, please contact us through our <a href="/contact" className="text-blue-500 underline">Contact Us</a> page.
      </p>
    </div>
    </m.div>

  );
}

export default TermsOfService;
