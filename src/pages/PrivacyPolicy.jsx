import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import InfoPageLayout from '../components/InfoPageLayout';

function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | KamiKoto</title>
        <meta name="description" content="Read the KamiKoto privacy policy and information about data handling." />
      </Helmet>

      <InfoPageLayout
        category="Legal"
        title="Privacy Policy"
        description="This policy outlines the information KamiKoto says it collects, how it is used, and the measures intended to protect privacy."
      >
        <h2>1. Information We Do Not Collect</h2>
        <p>
          KamiKoto is designed solely for educational purposes. We do not collect, store, or process personal data from users. This includes, but is not limited to:
        </p>
        <ul>
          <li>Personal identification information (for example, name, address, or email)</li>
          <li>Payment information</li>
          <li>Browsing history</li>
          <li>Location data</li>
        </ul>

        <h2>2. Use of Third-Party Services</h2>
        <p>
          The application utilizes third-party services such as Firebase and React Router for functionality and navigation. These services may have their own privacy policies governing the use of information. We encourage you to review their respective policies.
        </p>

        <h2>3. Cookies and Tracking Technologies</h2>
        <p>
          KamiKoto does not use cookies or other tracking technologies to monitor or store your activity.
        </p>

        <h2>4. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
        </p>

        <h2>5. Contact Us</h2>
        <p>
          If you have questions or concerns about this Privacy Policy, contact us through the <Link to="/contact">Contact Us</Link> page.
        </p>
      </InfoPageLayout>
    </>
  );
}

export default PrivacyPolicy;
