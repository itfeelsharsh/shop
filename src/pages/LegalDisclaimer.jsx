import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import InfoPageLayout from '../components/InfoPageLayout';

function LegalDisclaimer() {
  return (
    <>
      <Helmet>
        <title>Legal Disclaimer | KamiKoto</title>
        <meta name="description" content="Legal disclaimer for KamiKoto: a demonstration project built for education and fun, with no real payments or shipments." />
      </Helmet>

      <InfoPageLayout
        category="Legal"
        title="Legal Disclaimer"
        description="Please read this carefully. KamiKoto is an educational demonstration project, and nothing on this site is a real commercial offer."
      >
        <h2>1. Nature of this website</h2>
        <p>
          KamiKoto (the "Website") is a non-commercial demonstration and educational project. It was built for learning, experimentation and entertainment. It is not an operating retail business, and the store, brand and company details shown on the Website are illustrative only.
        </p>

        <h2>2. No real payments take place</h2>
        <p>
          All payment flows on this Website run in Razorpay <strong>test mode</strong>. No real money is charged, held or transferred. Test card numbers and UPI or wallet details published by Razorpay for testing may be used to simulate checkout. Any card number you enter that is not a Razorpay test credential will not be processed by the Website.
        </p>

        <h2>3. No real products or shipments</h2>
        <p>
          Products, prices, stock levels, reviews and images are for demonstration purposes. Orders placed on this Website do not result in real goods being packed, shipped or delivered, and no return, refund or warranty obligations arise from them.
        </p>

        <h2>4. No harm intended</h2>
        <p>
          The Website was made for fun and for educational purposes. No harm, fraud, misrepresentation or infringement is intended toward any person, business or brand. If you believe anything here causes a concern, please reach out through our <Link to="/contact">Contact Us</Link> page and it will be addressed promptly.
        </p>

        <h2>5. Third-party names, marks and images</h2>
        <p>
          Product names, brand names, logos, characters and images that appear on the Website belong to their respective owners. They are referenced only to demonstrate a shopping experience. There is no affiliation, sponsorship or endorsement by any of those owners.
        </p>

        <h2>6. Accuracy of content</h2>
        <p>
          Descriptions, specifications, pricing suggestions, warranty statements and other content may be generated or assisted by automated tools and may be inaccurate, incomplete or out of date. Do not rely on any of it for purchasing, legal, medical, financial or safety decisions.
        </p>

        <h2>7. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by applicable law, the creator of the Website is not liable for any direct, indirect, incidental or consequential loss arising from your use of, or inability to use, the Website or any content on it.
        </p>

        <h2>8. Changes</h2>
        <p>
          This disclaimer may be updated at any time without notice. Continued use of the Website after an update means you accept the revised disclaimer.
        </p>

        <div className="mt-8 rounded-xl border border-red-100 bg-red-50/50 p-5">
          <p className="mb-0">
            In short: it is a demo, it is for fun, it is for learning, and no real money or goods change hands here.
          </p>
          <p className="mb-0 mt-3">
            Questions? Visit our <Link to="/contact">Contact Us</Link> page.
          </p>
        </div>
      </InfoPageLayout>
    </>
  );
}

export default LegalDisclaimer;
